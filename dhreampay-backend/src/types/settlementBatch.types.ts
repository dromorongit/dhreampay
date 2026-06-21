import { Types } from 'mongoose'

export type BatchSource = 'bank' | 'visa'

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ISettlementBatch {
  _id: Types.ObjectId
  batchId: string
  batchDate: Date
  source: BatchSource
  fileName: string
  totalAmount: number
  totalCount: number
  status: BatchStatus
  uploadedBy: string
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSettlementBatchDTO {
  batchId: string
  batchDate: Date
  source: BatchSource
  fileName: string
  totalAmount?: number
  totalCount?: number
  status?: BatchStatus
  uploadedBy: string
  errorMessage?: string
}