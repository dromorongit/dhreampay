import { Types } from 'mongoose'
import * as settlementBatchRepository from '../../repositories/settlementBatch.repository.js'
import * as reconciliationRecordRepository from '../../repositories/reconciliationRecord.repository.js'
import * as exceptionRepository from '../../repositories/exception.repository.js'
import * as transactionRepository from '../../repositories/transaction.repository.js'
import { ISettlementBatch } from '../../types/settlementBatch.types.js'
import { ExceptionType } from '../../types/exception.types.js'
import { IException } from '../../types/exception.types.js'
import { ITransaction } from '../../types/transaction.types.js'

interface BatchSummaryReport {
  batch: {
    batchId: string
    batchDate: Date
    source: 'bank' | 'visa'
    fileName: string
    totalAmount: number
    totalCount: number
    status: string
    uploadedBy: string
    createdAt: Date
    updatedAt: Date
  }
  totalTransactions: number
  matched: number
  partial: number
  unmatched: number
  exceptions: number
  totalMatchedAmount: number
  totalUnmatchedAmount: number
  exceptionBreakdown: Record<ExceptionType, number>
  generatedAt: Date
}

async function generateBatchSummary(batchId: string): Promise<BatchSummaryReport> {
  let objectId: Types.ObjectId
  try {
    objectId = new Types.ObjectId(batchId)
  } catch {
    throw new Error('Invalid batchId format')
  }

  const batch = await settlementBatchRepository.findById(objectId)

  if (batch === null) {
    throw new Error('Settlement batch not found')
  }

  const records = await reconciliationRecordRepository.find(
    { settlementBatchId: objectId },
    {}
  )

  const recordIds = records.data.map((r: { _id: Types.ObjectId }) => r._id)

  const exceptions = await exceptionRepository.find(
    { reconciliationRecordId: { $in: recordIds } } as unknown as Partial<IException>,
    {}
  )

  const transactionIds = new Set<Types.ObjectId>()
  for (const record of records.data) {
    if (record.bankTransactionId instanceof Types.ObjectId) {
      transactionIds.add(record.bankTransactionId)
    }
    if (record.visaTransactionId instanceof Types.ObjectId) {
      transactionIds.add(record.visaTransactionId)
    }
  }

  const transactionsMap = new Map<string, ITransaction>()
  if (transactionIds.size > 0) {
    const transactions = await transactionRepository.find(
      { _id: { $in: Array.from(transactionIds) } } as unknown as Partial<ITransaction>,
      {}
    )
    for (const tx of transactions.data) {
      transactionsMap.set(tx._id.toString(), tx)
    }
  }

  let matched = 0
  let partial = 0
  let unmatched = 0
  let exceptionsCount = 0
  let totalMatchedAmount = 0
  let totalUnmatchedAmount = 0

  const exceptionBreakdown: Record<ExceptionType, number> = {
    amount_mismatch: 0,
    missing_bank_record: 0,
    missing_visa_record: 0,
    duplicate: 0,
    date_mismatch: 0,
    other: 0
  }

  for (const record of records.data) {
    const bankTx = record.bankTransactionId instanceof Types.ObjectId
      ? transactionsMap.get(record.bankTransactionId.toString())
      : null
    const visaTx = record.visaTransactionId instanceof Types.ObjectId
      ? transactionsMap.get(record.visaTransactionId.toString())
      : null

    const matchedAmount = bankTx?.amount ?? visaTx?.amount ?? 0

    if (record.matchStatus === 'matched') {
      matched = matched + 1
      totalMatchedAmount = totalMatchedAmount + matchedAmount
    } else if (record.matchStatus === 'partial') {
      partial = partial + 1
    } else if (record.matchStatus === 'unmatched') {
      unmatched = unmatched + 1
      totalUnmatchedAmount = totalUnmatchedAmount + matchedAmount
    } else if (record.matchStatus === 'exception') {
      exceptionsCount = exceptionsCount + 1
    }
  }

  for (const exception of exceptions.data) {
    const key = exception.exceptionType as ExceptionType
    if (key in exceptionBreakdown) {
      exceptionBreakdown[key] = exceptionBreakdown[key] + 1
    }
  }

  const batchPlain: BatchSummaryReport['batch'] = {
    batchId: batch.batchId,
    batchDate: batch.batchDate,
    source: batch.source,
    fileName: batch.fileName,
    totalAmount: batch.totalAmount,
    totalCount: batch.totalCount,
    status: batch.status,
    uploadedBy: batch.uploadedBy,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt
  }

  return {
    batch: batchPlain,
    totalTransactions: records.data.length,
    matched,
    partial,
    unmatched,
    exceptions: exceptionsCount,
    totalMatchedAmount,
    totalUnmatchedAmount,
    exceptionBreakdown,
    generatedAt: new Date()
  }
}

export {
  generateBatchSummary,
  type BatchSummaryReport
}