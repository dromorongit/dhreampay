import mongoose, { Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'RECONCILIATION_OFFICER' | 'VIP_DESK' | 'AUDITOR'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'RECONCILIATION_OFFICER', 'VIP_DESK', 'AUDITOR'],
      default: 'RECONCILIATION_OFFICER',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)