import { z } from 'zod'

const batchSummaryParamsSchema = z.object({
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type BatchSummaryParams = z.infer<typeof batchSummaryParamsSchema>

const batchIdParamsSchema = z.object({
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type BatchIdParams = z.infer<typeof batchIdParamsSchema>

const exportParamsSchema = z.object({
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type ExportParams = z.infer<typeof exportParamsSchema>

const exportQuerySchema = z.object({
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  format: z.enum(['xlsx', 'csv']).optional().default('xlsx'),
  includeExceptions: z.coerce.boolean().optional().default(true),
  includeUnmatched: z.coerce.boolean().optional().default(true)
})

type ExportQuery = z.infer<typeof exportQuerySchema>

export {
  batchSummaryParamsSchema,
  type BatchSummaryParams,
  batchIdParamsSchema,
  type BatchIdParams,
  exportParamsSchema,
  type ExportParams,
  exportQuerySchema,
  type ExportQuery
}