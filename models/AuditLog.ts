import mongoose, { Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  entity: string
  entityId: string
  details?: string
  ipAddress?: string
  createdAt: Date
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
)

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)