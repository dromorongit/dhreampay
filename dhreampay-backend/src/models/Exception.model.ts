import mongoose, { Schema, model } from 'mongoose'
import { IException } from '../types/exception.types.js'

const ExceptionSchema = new Schema<IException>({
  exceptionId: { type: String, required: true },
  reconciliationRecordId: { type: Schema.Types.ObjectId, ref: 'ReconciliationRecord', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  exceptionType: { type: String, enum: ['amount_mismatch', 'missing_bank_record', 'missing_visa_record', 'duplicate', 'date_mismatch', 'other'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true, default: 'medium' },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'escalated'], required: true, default: 'open' },
  description: { type: String, required: true },
  assignedTo: { type: String },
  resolvedAt: { type: Date },
  resolutionNotes: { type: String }
}, {
  timestamps: true
})

ExceptionSchema.index({ exceptionId: 1 }, { unique: true })
ExceptionSchema.index({ status: 1, severity: 1 })

export { ExceptionSchema }

export const ExceptionModel = model<IException>('Exception', ExceptionSchema)