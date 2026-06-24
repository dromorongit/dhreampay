import { z } from 'zod'

const uploadQuerySchema = z.object({
  source: z.enum(['bank', 'visa'], { required_error: 'source is required' })
})

type UploadQuery = z.infer<typeof uploadQuerySchema>

export { uploadQuerySchema, UploadQuery }