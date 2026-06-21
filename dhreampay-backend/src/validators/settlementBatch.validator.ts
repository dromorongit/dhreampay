import { z } from 'zod'

const batchStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed'])
const sourceEnum = z.enum(['bank', 'visa'])

const settlementBatchListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: batchStatusEnum.optional(),
  source: sourceEnum.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
})

type SettlementBatchListQuery = z.infer<typeof settlementBatchListQuerySchema>

const settlementBatchParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type SettlementBatchParams = z.infer<typeof settlementBatchParamsSchema>

export {
  settlementBatchListQuerySchema,
  settlementBatchParamsSchema,
  type SettlementBatchListQuery,
  type SettlementBatchParams
}