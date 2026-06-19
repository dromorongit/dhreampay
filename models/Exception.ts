import mongoose, { Document, Model } from 'mongoose'

export interface IException extends Document {
  transactionId: mongoose.Types.ObjectId
  exceptionType: 'UNMATCHED' | 'DUPLICATE' | 'AMOUNT_MISMATCH' | 'DATE_MISMATCH' | 'MISSING_REFERENCE' | 'VIP_REVIEW'
  reason: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED'
  resolvedBy?: mongoose.Types.ObjectId
  resolutionNote?: string
  resolvedAt?: Date
  reconciliationJobId: mongoose.Types.ObjectId
  createdAt: Date
}

const ExceptionSchema = new mongoose.Schema<IException>(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,
    },
    exceptionType: {
      type: String,
      enum: ['UNMATCHED', 'DUPLICATE', 'AMOUNT_MISMATCH', 'DATE_MISMATCH', 'MISSING_REFERENCE', 'VIP_REVIEW'],
      required: true,
    },
    reason: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'ESCALATED'],
      default: 'OPEN',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNote: { type: String },
    resolvedAt: { type: Date },
    reconciliationJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationJob',
      required: true,
    },
  },
  { timestamps: true }
)

export const Exception: Model<IException> =
  mongoose.models.Exception || mongoose.model<IException>('Exception', ExceptionSchema)