import mongoose, { Schema, model } from 'mongoose'
import { IAuditLog } from '../types/auditLog.types.js'

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  entityType: { type: String, enum: ['Transaction', 'SettlementBatch', 'ReconciliationRecord', 'Exception'], required: true },
  entityId: { type: String, required: true },
  performedBy: { type: String, required: true },
  changes: { type: Schema.Types.Mixed },
  ipAddress: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

AuditLogSchema.index({ entityType: 1, entityId: 1 })
AuditLogSchema.index({ performedBy: 1 })

export { AuditLogSchema }

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema)