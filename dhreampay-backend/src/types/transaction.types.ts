import { Types } from 'mongoose'

export type SourceType = 'bank' | 'visa'

export type TransactionType = 'purchase' | 'refund' | 'reversal' | 'adjustment'

export type TransactionStatus = 'unmatched' | 'matched' | 'exception' | 'resolved'

export interface ITransaction {
  _id: Types.ObjectId
  transactionId: string
  source: SourceType
  transactionType: TransactionType
  cardNumberMasked: string
  amount: number
  currency: string
  transactionDate: Date
  postingDate: Date
  merchantId: string
  terminalId?: string
  authorizationCode?: string
  isVIP: boolean
  settlementBatchId?: Types.ObjectId
  status: TransactionStatus
  rawData?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionDTO {
  transactionId: string
  source: SourceType
  transactionType: TransactionType
  cardNumberMasked: string
  amount: number
  currency?: string
  transactionDate: Date
  postingDate: Date
  merchantId: string
  terminalId?: string
  authorizationCode?: string
  isVIP?: boolean
  settlementBatchId?: Types.ObjectId
  status?: TransactionStatus
  rawData?: Record<string, unknown>
}