import XLSX from 'xlsx'
import { Types } from 'mongoose'
import * as settlementBatchRepository from '../../repositories/settlementBatch.repository.js'
import * as reconciliationRecordRepository from '../../repositories/reconciliationRecord.repository.js'
import * as transactionRepository from '../../repositories/transaction.repository.js'
import { ITransaction } from '../../types/transaction.types.js'

interface ExportOptions {
  batchId: string
  format: 'xlsx' | 'csv'
  includeExceptions: boolean
  includeUnmatched: boolean
}

interface ExportResult {
  buffer: Buffer
  filename: string
  contentType: string
}

interface ReconciliationRecordWithTransactions {
  _id: Types.ObjectId
  recordId: string
  bankTransactionId?: Types.ObjectId
  visaTransactionId?: Types.ObjectId
  settlementBatchId: Types.ObjectId
  matchStatus: string
  matchType?: string
  amountDifference?: number
  reconciledAt?: Date
  reconciledBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

async function generateBatchExport(options: ExportOptions): Promise<ExportResult> {
  const { batchId, format, includeExceptions, includeUnmatched } = options

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

  let filteredRecords = records.data as ReconciliationRecordWithTransactions[]

  if (includeExceptions === false) {
    filteredRecords = filteredRecords.filter(r => r.matchStatus !== 'exception')
  }

  if (includeUnmatched === false) {
    filteredRecords = filteredRecords.filter(r => r.matchStatus !== 'unmatched')
  }

  const transactionIds: Types.ObjectId[] = []
  for (const record of filteredRecords) {
    if (record.bankTransactionId instanceof Types.ObjectId && !transactionIds.includes(record.bankTransactionId)) {
      transactionIds.push(record.bankTransactionId)
    }
    if (record.visaTransactionId instanceof Types.ObjectId && !transactionIds.includes(record.visaTransactionId)) {
      transactionIds.push(record.visaTransactionId)
    }
  }

  const transactionsMap = new Map<string, ITransaction>()
  if (transactionIds.length > 0) {
    const transactions = await transactionRepository.find(
      { _id: { $in: transactionIds } } as unknown as Partial<ITransaction>,
      {}
    )
    for (const tx of transactions.data) {
      transactionsMap.set(tx._id.toString(), tx)
    }
  }

  const rows = filteredRecords.map(record => {
    const bankTx = record.bankTransactionId instanceof Types.ObjectId 
      ? transactionsMap.get(record.bankTransactionId.toString()) ?? null
      : null
    const visaTx = record.visaTransactionId instanceof Types.ObjectId
      ? transactionsMap.get(record.visaTransactionId.toString()) ?? null
      : null

    return {
      'Record ID': record.recordId,
      'Match Status': record.matchStatus,
      'Match Type': record.matchType ?? '',
      'Bank Transaction ID': bankTx?.transactionId ?? '',
      'Visa Transaction ID': visaTx?.transactionId ?? '',
      'Bank Amount': bankTx?.amount ?? '',
      'Visa Amount': visaTx?.amount ?? '',
      'Amount Difference': record.amountDifference ?? '',
      'Transaction Date': record.createdAt.toISOString().split('T')[0],
      'Merchant ID': bankTx?.merchantId ?? visaTx?.merchantId ?? '',
      'Authorization Code': bankTx?.authorizationCode ?? visaTx?.authorizationCode ?? '',
      'Notes': record.notes ?? ''
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  let buffer: Buffer
  let filename: string
  let contentType: string

  const dateStr = new Date().toISOString().split('T')[0]

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws)
    buffer = Buffer.from(csv, 'utf8')
    filename = `dhreampay-reconciliation-${batch.batchId}-${dateStr}.csv`
    contentType = 'text/csv'
  } else {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation')
    buffer = Buffer.from(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }))
    filename = `dhreampay-reconciliation-${batch.batchId}-${dateStr}.xlsx`
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }

  return { buffer, filename, contentType }
}

export {
  generateBatchExport,
  type ExportOptions,
  type ExportResult
}