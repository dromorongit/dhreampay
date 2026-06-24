import { z } from 'zod'

const exceptionStatusEnum = z.enum(['open', 'investigating', 'resolved', 'escalated'])
const severityEnum = z.enum(['low', 'medium', 'high'])
const exceptionTypeEnum = z.enum(['amount_mismatch', 'missing_bank_record', 'missing_visa_record', 'duplicate', 'date_mismatch', 'other'])

const exceptionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: exceptionStatusEnum.optional(),
  severity: severityEnum.optional(),
  exceptionType: exceptionTypeEnum.optional()
})

type ExceptionListQuery = z.infer<typeof exceptionListQuerySchema>

const exceptionParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type ExceptionParams = z.infer<typeof exceptionParamsSchema>

const updateExceptionSchema = z.object({
  status: exceptionStatusEnum.optional(),
  assignedTo: z.string().optional(),
  resolutionNotes: z.string().optional()
})

type UpdateExceptionBody = z.infer<typeof updateExceptionSchema>

export {
  exceptionListQuerySchema,
  exceptionParamsSchema,
  updateExceptionSchema,
  type ExceptionListQuery,
  type ExceptionParams,
  type UpdateExceptionBody
}