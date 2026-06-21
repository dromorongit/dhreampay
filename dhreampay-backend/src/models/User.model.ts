import mongoose, { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcrypt'
import { IUser, UserRole } from '../types/user.types.js'

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>
}

type UserDocument = Document & IUser & IUserMethods

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'reconciler', 'viewer'], required: true, default: 'reconciler' },
  isActive: { type: Boolean, required: true, default: true },
  lastLoginAt: { type: Date }
}, {
  timestamps: true
})

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export { UserSchema }

export const UserModel = model<IUser>('User', UserSchema)