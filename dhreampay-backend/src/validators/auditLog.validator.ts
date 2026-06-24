import { z } from 'zod'

const entityTypeEnum = z.enum(['Transaction', 'SettlementBatch', 'ReconciliationRecord', 'Exception'])

const auditLogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: entityTypeEnum.optional(),
  entityId: z.string().optional(),
  performedBy: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
})

type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>

const auditLogParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type AuditLogParams = z.infer<typeof auditLogParamsSchema>

export {
  auditLogListQuerySchema,
  auditLogParamsSchema,
  type AuditLogListQuery,
  type AuditLogParams
}