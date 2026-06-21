import { Types } from 'mongoose'

export type EntityType = 'Transaction' | 'SettlementBatch' | 'ReconciliationRecord' | 'Exception'

export interface IAuditLog {
  _id: Types.ObjectId
  action: string
  entityType: EntityType
  entityId: string
  performedBy: string
  changes?: Record<string, unknown>
  ipAddress?: string
  createdAt: Date
}

export interface CreateAuditLogDTO {
  action: string
  entityType: EntityType
  entityId: string
  performedBy: string
  changes?: Record<string, unknown>
  ipAddress?: string
}