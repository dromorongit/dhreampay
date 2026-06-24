import { Types } from 'mongoose'
import { ITransaction } from './transaction.types.js'
import { IReconciliationRecord } from './reconciliationRecord.types.js'

export type MatchStatus = 'matched' | 'unmatched' | 'partial' | 'exception'
export type MatchType = 'exact' | 'fuzzy' | 'manual'

export interface MatchResult {
  bankTransaction: ITransaction | null
  visaTransaction: ITransaction | null
  matchType: MatchType
  matchStatus: MatchStatus
  amountDifference?: number
  reason?: string
}

export interface MatchingSummary {
  batchId: string
  totalProcessed: number
  matched: number
  partial: number
  exceptions: number
  unmatched: number
}

export interface ReconciliationStatus {
  settlementBatchId: Types.ObjectId
  matched: number
  unmatched: number
  exceptions: number
  partial: number
}