import mongoose, { Schema, model } from 'mongoose'
import { IVIPAccount } from '../types/vipAccount.types.js'

const VIPAccountSchema = new Schema<IVIPAccount>({
  accountId: { type: String, required: true },
  cardNumberMasked: { type: String, required: true },
  customerName: { type: String, required: true },
  vipTier: { type: String, enum: ['platinum', 'gold', 'silver'], required: true },
  accountManager: { type: String },
  notes: { type: String },
  isActive: { type: Boolean, required: true, default: true }
}, {
  timestamps: true
})

VIPAccountSchema.index({ accountId: 1 }, { unique: true })
VIPAccountSchema.index({ cardNumberMasked: 1 })

export { VIPAccountSchema }

export const VIPAccountModel = model<IVIPAccount>('VIPAccount', VIPAccountSchema)