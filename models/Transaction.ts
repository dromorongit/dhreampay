import mongoose, { Document, Model } from 'mongoose'

export interface ITransaction extends Document {
  transactionRef: string
  cardNumber: string
  cardHolderName: string
  amount: number
  currency: string
  transactionDate: Date
  settlementDate?: Date
  merchantName?: string
  merchantCode?: string
  transactionType: 'PURCHASE' | 'REFUND' | 'REVERSAL' | 'CHARGEBACK' | 'FEE' | 'SETTLEMENT'
  status: 'PENDING' | 'MATCHED' | 'UNMATCHED' | 'EXCEPTION' | 'SETTLED'
  source: 'BANK' | 'VISA'
  isVIP: boolean
  batchId: string
  reconciliationJobId?: mongoose.Types.ObjectId
  createdAt: Date
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    transactionRef: { type: String, required: true, unique: true },
    cardNumber: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    transactionDate: { type: Date, required: true },
    settlementDate: { type: Date },
    merchantName: { type: String },
    merchantCode: { type: String },
    transactionType: {
      type: String,
      enum: ['PURCHASE', 'REFUND', 'REVERSAL', 'CHARGEBACK', 'FEE', 'SETTLEMENT'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'MATCHED', 'UNMATCHED', 'EXCEPTION', 'SETTLED'],
      default: 'PENDING',
    },
    source: { type: String, enum: ['BANK', 'VISA'], required: true },
    isVIP: { type: Boolean, default: false },
    batchId: { type: String, required: true },
    reconciliationJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationJob',
    },
  },
  { timestamps: true }
)

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)