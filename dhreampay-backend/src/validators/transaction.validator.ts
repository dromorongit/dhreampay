import { z } from 'zod'

const transactionStatusEnum = z.enum(['unmatched', 'matched', 'exception', 'resolved'])
const sourceEnum = z.enum(['bank', 'visa'])

const transactionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: transactionStatusEnum.optional(),
  source: sourceEnum.optional(),
  isVIP: z.coerce.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  settlementBatchId: z.string().optional()
})

type TransactionListQuery = z.infer<typeof transactionListQuerySchema>

const transactionParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type TransactionParams = z.infer<typeof transactionParamsSchema>

export {
  transactionListQuerySchema,
  transactionParamsSchema,
  type TransactionListQuery,
  type TransactionParams
}