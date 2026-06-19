import mongoose, { Document, Model } from 'mongoose'

export interface IMatchedRecord extends Document {
  bankTransactionId: mongoose.Types.ObjectId
  visaTransactionId: mongoose.Types.ObjectId
  matchConfidence: number
  matchMethod: 'EXACT' | 'FUZZY' | 'MANUAL'
  reconciliationJobId: mongoose.Types.ObjectId
  matchedAt: Date
}

const MatchedRecordSchema = new mongoose.Schema<IMatchedRecord>(
  {
    bankTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,
    },
    visaTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,
    },
    matchConfidence: { type: Number, min: 0, max: 1, required: true },
    matchMethod: {
      type: String,
      enum: ['EXACT', 'FUZZY', 'MANUAL'],
      required: true,
    },
    reconciliationJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationJob',
      required: true,
    },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const MatchedRecord: Model<IMatchedRecord> =
  mongoose.models.MatchedRecord ||
  mongoose.model<IMatchedRecord>('MatchedRecord', MatchedRecordSchema)