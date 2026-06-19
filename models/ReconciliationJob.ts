import mongoose, { Document, Model } from 'mongoose'

export interface IReconciliationJob extends Document {
  jobName: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  totalTransactions: number
  totalMatched: number
  totalUnmatched: number
  totalVIP: number
  startedAt: Date
  completedAt?: Date
  triggeredBy: mongoose.Types.ObjectId
}

const ReconciliationJobSchema = new mongoose.Schema<IReconciliationJob>(
  {
    jobName: { type: String, required: true },
    status: {
      type: String,
      enum: ['RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'RUNNING',
    },
    totalTransactions: { type: Number, default: 0 },
    totalMatched: { type: Number, default: 0 },
    totalUnmatched: { type: Number, default: 0 },
    totalVIP: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const ReconciliationJob: Model<IReconciliationJob> =
  mongoose.models.ReconciliationJob ||
  mongoose.model<IReconciliationJob>('ReconciliationJob', ReconciliationJobSchema)