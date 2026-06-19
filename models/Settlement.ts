import mongoose, { Document, Model } from 'mongoose'

export interface ISettlement extends Document {
  reconciliationJobId: mongoose.Types.ObjectId
  totalSettlementAmount: number
  totalFees: number
  totalVIPAmount: number
  currency: string
  settlementStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  settledAt?: Date
  createdAt: Date
}

const SettlementSchema = new mongoose.Schema<ISettlement>(
  {
    reconciliationJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationJob',
      required: true,
      unique: true,
    },
    totalSettlementAmount: { type: Number, required: true },
    totalFees: { type: Number, default: 0 },
    totalVIPAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    settlementStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    settledAt: { type: Date },
  },
  { timestamps: true }
)

export const Settlement: Model<ISettlement> =
  mongoose.models.Settlement || mongoose.model<ISettlement>('Settlement', SettlementSchema)