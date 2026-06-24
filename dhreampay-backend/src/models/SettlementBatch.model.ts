import mongoose, { Schema, model } from 'mongoose'
import { ISettlementBatch } from '../types/settlementBatch.types.js'

const SettlementBatchSchema = new Schema<ISettlementBatch>({
  batchId: { type: String, required: true },
  batchDate: { type: Date, required: true },
  source: { type: String, enum: ['bank', 'visa'], required: true },
  fileName: { type: String, required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  totalCount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], required: true, default: 'pending' },
  uploadedBy: { type: String, required: true },
  errorMessage: { type: String },
  reconciledAt: { type: Date }
}, {
  timestamps: true
})

SettlementBatchSchema.index({ batchId: 1 }, { unique: true })

export { SettlementBatchSchema }

export const SettlementBatchModel = model<ISettlementBatch>('SettlementBatch', SettlementBatchSchema)