import { z } from 'zod'

const triggerReconciliationSchema = z.object({
  batchId: z.string().min(1, 'batchId is required')
})

type TriggerReconciliationBody = z.infer<typeof triggerReconciliationSchema>

const batchIdParamsSchema = z.object({
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type BatchIdParams = z.infer<typeof batchIdParamsSchema>

export {
  triggerReconciliationSchema,
  type TriggerReconciliationBody,
  batchIdParamsSchema,
  type BatchIdParams
}