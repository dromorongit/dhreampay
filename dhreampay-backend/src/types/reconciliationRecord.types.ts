import { Types } from 'mongoose'

export type MatchStatus = 'matched' | 'unmatched' | 'partial' | 'exception'
export type MatchType = 'exact' | 'fuzzy' | 'manual'

export interface IReconciliationRecord {
  _id: Types.ObjectId
  recordId: string
  bankTransactionId?: Types.ObjectId
  visaTransactionId?: Types.ObjectId
  settlementBatchId: Types.ObjectId
  matchStatus: MatchStatus
  matchType?: MatchType
  amountDifference?: number
  reconciledAt?: Date
  reconciledBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateReconciliationRecordDTO {
  recordId: string
  bankTransactionId?: Types.ObjectId
  visaTransactionId?: Types.ObjectId
  settlementBatchId: Types.ObjectId
  matchStatus?: MatchStatus
  matchType?: MatchType
  amountDifference?: number
  reconciledAt?: Date
  reconciledBy?: string
  notes?: string
}