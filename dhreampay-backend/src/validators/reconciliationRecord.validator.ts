import { z } from 'zod'

const matchStatusEnum = z.enum(['matched', 'unmatched', 'partial', 'exception'])
const matchTypeEnum = z.enum(['exact', 'fuzzy', 'manual'])

const reconciliationRecordListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  matchStatus: matchStatusEnum.optional(),
  settlementBatchId: z.string().optional()
})

type ReconciliationRecordListQuery = z.infer<typeof reconciliationRecordListQuerySchema>

const reconciliationRecordParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type ReconciliationRecordParams = z.infer<typeof reconciliationRecordParamsSchema>

const updateReconciliationSchema = z.object({
  matchStatus: matchStatusEnum.optional(),
  matchType: matchTypeEnum.optional(),
  notes: z.string().optional(),
  reconciledBy: z.string().optional()
})

type UpdateReconciliationBody = z.infer<typeof updateReconciliationSchema>

export {
  reconciliationRecordListQuerySchema,
  reconciliationRecordParamsSchema,
  updateReconciliationSchema,
  type ReconciliationRecordListQuery,
  type ReconciliationRecordParams,
  type UpdateReconciliationBody
}