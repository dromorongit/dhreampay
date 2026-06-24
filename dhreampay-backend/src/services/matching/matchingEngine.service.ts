import { Types } from 'mongoose'
import { env } from '../../config/env.js'
import * as settlementBatchRepository from '../../repositories/settlementBatch.repository.js'
import * as transactionRepository from '../../repositories/transaction.repository.js'
import * as reconciliationRecordRepository from '../../repositories/reconciliationRecord.repository.js'
import * as auditLogRepository from '../../repositories/auditLog.repository.js'
import { ISettlementBatch } from '../../types/settlementBatch.types.js'
import { ITransaction, SourceType } from '../../types/transaction.types.js'
import { CreateReconciliationRecordDTO, MatchType } from '../../types/reconciliationRecord.types.js'
import { MatchingSummary, MatchResult } from '../../types/matching.types.js'
import { exactMatch, fuzzyMatch, calculateAmountDifference, datesWithinWindow } from './matchingStrategies.js'
import { raiseException } from './exceptionRaiser.service.js'

function generateRecordId(): string {
  return `REC-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
}

function determineCounterSource(source: SourceType): SourceType {
  if (source === 'bank') {
    return 'visa'
  }
  return 'bank'
}

async function runMatchingForBatch(batchId: Types.ObjectId, performedBy: string): Promise<MatchingSummary> {
  const batch = await settlementBatchRepository.findById(batchId)

  if (batch === null) {
    throw new Error('Settlement batch not found')
  }

  if (batch.status !== 'completed') {
    throw new Error(`Settlement batch is not in a processable state. Current status: ${batch.status}`)
  }

  const counterSource = determineCounterSource(batch.source)
  const amountTolerance = env.AMOUNT_TOLERANCE ?? 0.01
  const dateWindowDays = env.DATE_WINDOW_DAYS ?? 1

  const batchTransactions = await transactionRepository.find({ settlementBatchId: batchId }, {})
  const counterPool = await transactionRepository.find({
    source: counterSource,
    status: 'unmatched'
  } as unknown as Partial<ITransaction>, {})

  let matched = 0
  let partial = 0
  let exceptions = 0
  let unmatched = 0

  for (const bankTx of batchTransactions.data) {
    const existingRecord = await reconciliationRecordRepository.findOne({
      $or: [
        { bankTransactionId: bankTx._id },
        { visaTransactionId: bankTx._id }
      ]
    })

    if (existingRecord !== null) {
      continue
    }

    let matchResult: MatchResult | null = null
    let matchedCounterTx: ITransaction | null = null
    let matchType: MatchType = 'exact'

    for (const counterTx of counterPool.data) {
      if (exactMatch(bankTx, counterTx, amountTolerance, dateWindowDays)) {
        matchResult = {
          bankTransaction: bankTx,
          visaTransaction: counterTx,
          matchType: 'exact',
          matchStatus: 'matched'
        }
        matchedCounterTx = counterTx
        matchType = 'exact'
        break
      }
    }

    if (matchResult === null) {
      for (const counterTx of counterPool.data) {
        if (fuzzyMatch(bankTx, counterTx, amountTolerance, dateWindowDays)) {
          matchResult = {
            bankTransaction: bankTx,
            visaTransaction: counterTx,
            matchType: 'fuzzy',
            matchStatus: 'matched'
          }
          matchedCounterTx = counterTx
          matchType = 'fuzzy'
          break
        }
      }
    }

    if (matchResult !== null) {
      const recordData: CreateReconciliationRecordDTO = {
        recordId: generateRecordId(),
        bankTransactionId: bankTx._id,
        visaTransactionId: matchedCounterTx?._id,
        settlementBatchId: batch._id,
        matchStatus: 'matched',
        matchType: matchType,
        reconciledAt: new Date(),
        reconciledBy: performedBy
      }

      const record = await reconciliationRecordRepository.create(recordData)

      await transactionRepository.updateById(bankTx._id, { status: 'matched' })
      if (matchedCounterTx !== null) {
        await transactionRepository.updateById(matchedCounterTx._id, { status: 'matched' })
      }

      await auditLogRepository.create({
        action: 'match.found',
        entityType: 'ReconciliationRecord',
        entityId: record._id.toString(),
        performedBy
      })

      matched = matched + 1
    } else {
      const amountDiff = findAmountInCounterPool(bankTx, counterPool.data, amountTolerance)
      let exceptionType: 'missing_visa_record' | 'missing_bank_record' | 'date_mismatch' | 'amount_mismatch' = 'missing_visa_record'
      let severity: 'high' | 'medium' = 'high'
      let reason = ''

      if (batch.source === 'bank') {
        if (amountDiff !== null) {
          const counterTx = counterPool.data.find(tx => tx.amount === amountDiff.amount)
          if (counterTx !== null && counterTx !== undefined) {
            if (!datesWithinWindow(bankTx.transactionDate, counterTx.transactionDate, dateWindowDays)) {
              exceptionType = 'date_mismatch'
              severity = 'medium'
              reason = 'Amount matches but date is outside tolerance window'
            }
          } else {
            exceptionType = 'amount_mismatch'
            severity = 'medium'
            reason = 'Amount difference detected with no matching amount on counter side'
          }
        } else {
          reason = 'No matching transaction found in counter source'
        }
      } else {
        reason = 'No matching transaction found in counter source'
      }

      const recordData: CreateReconciliationRecordDTO = {
        recordId: generateRecordId(),
        bankTransactionId: batch.source === 'visa' ? matchedCounterTx?._id : bankTx._id,
        visaTransactionId: batch.source === 'bank' ? matchedCounterTx?._id : bankTx._id,
        settlementBatchId: batch._id,
        matchStatus: 'unmatched',
        matchType: 'exact',
        reconciledAt: new Date(),
        reconciledBy: performedBy
      }

      const record = await reconciliationRecordRepository.create(recordData)

      await raiseException({
        reconciliationRecordId: record._id,
        transactionId: bankTx._id,
        exceptionType,
        severity,
        description: reason,
        performedBy
      })

      unmatched = unmatched + 1
      exceptions = exceptions + 1
    }
  }

  const summary: MatchingSummary = {
    batchId: batch.batchId,
    totalProcessed: batchTransactions.data.length,
    matched,
    partial,
    exceptions,
    unmatched
  }

  await settlementBatchRepository.updateById(batch._id, { reconciledAt: new Date() } as unknown as Partial<ISettlementBatch>)

  await auditLogRepository.create({
    action: 'matching.completed',
    entityType: 'SettlementBatch',
    entityId: batch._id.toString(),
    performedBy,
    changes: {
      totalProcessed: summary.totalProcessed,
      matched: summary.matched,
      partial: summary.partial,
      exceptions: summary.exceptions,
      unmatched: summary.unmatched
    }
  })

  return summary
}

function findAmountInCounterPool(
  tx: ITransaction,
  counterPool: ITransaction[],
  amountTolerance: number
): { tx: ITransaction; amount: number } | null {
  for (const counterTx of counterPool) {
    const diff = calculateAmountDifference(tx, counterTx)
    if (diff <= amountTolerance) {
      return { tx: counterTx, amount: tx.amount }
    }
  }
  return null
}

async function getBatchReconciliationStatus(batchId: Types.ObjectId) {
  const records = await reconciliationRecordRepository.find({ settlementBatchId: batchId as unknown as Types.ObjectId }, {})

  const summary = {
    matched: 0,
    unmatched: 0,
    exceptions: 0,
    partial: 0
  }

  for (const record of records.data) {
    if (record.matchStatus === 'matched') {
      summary.matched = summary.matched + 1
    } else if (record.matchStatus === 'unmatched') {
      summary.unmatched = summary.unmatched + 1
    } else if (record.matchStatus === 'partial') {
      summary.partial = summary.partial + 1
    } else if (record.matchStatus === 'exception') {
      summary.exceptions = summary.exceptions + 1
    }
  }

  return summary
}

export { runMatchingForBatch, getBatchReconciliationStatus }