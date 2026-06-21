import mongoose, { Schema, model } from 'mongoose'
import { IReconciliationRecord } from '../types/reconciliationRecord.types.js'

const ReconciliationRecordSchema = new Schema<IReconciliationRecord>({
  recordId: { type: String, required: true },
  bankTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  visaTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  settlementBatchId: { type: Schema.Types.ObjectId, ref: 'SettlementBatch', required: true },
  matchStatus: { type: String, enum: ['matched', 'unmatched', 'partial', 'exception'], required: true, default: 'unmatched' },
  matchType: { type: String, enum: ['exact', 'fuzzy', 'manual'] },
  amountDifference: { type: Number },
  reconciledAt: { type: Date },
  reconciledBy: { type: String },
  notes: { type: String }
}, {
  timestamps: true
})

ReconciliationRecordSchema.index({ recordId: 1 }, { unique: true })
ReconciliationRecordSchema.index({ settlementBatchId: 1, matchStatus: 1 })

export { ReconciliationRecordSchema }

export const ReconciliationRecordModel = model<IReconciliationRecord>('ReconciliationRecord', ReconciliationRecordSchema)