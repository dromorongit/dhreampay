import { z } from 'zod'

const vipTierEnum = z.enum(['platinum', 'gold', 'silver'])

const createVIPAccountSchema = z.object({
  accountId: z.string().min(1, 'AccountId is required'),
  cardNumberMasked: z.string().min(1, 'Card number masked is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  vipTier: vipTierEnum,
  accountManager: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional().default(true)
})

type CreateVIPAccountDTO = {
  accountId: string
  cardNumberMasked: string
  customerName: string
  vipTier: 'platinum' | 'gold' | 'silver'
  accountManager?: string
  notes?: string
  isActive?: boolean
}

const updateVIPAccountSchema = z.object({
  cardNumberMasked: z.string().optional(),
  customerName: z.string().optional(),
  vipTier: vipTierEnum.optional(),
  accountManager: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
})

type UpdateVIPAccountDTO = z.infer<typeof updateVIPAccountSchema>

const vipAccountParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type VipAccountParams = z.infer<typeof vipAccountParamsSchema>

const listVIPAccountQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  vipTier: vipTierEnum.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional()
})

type ListVIPAccountQuery = z.infer<typeof listVIPAccountQuerySchema>

export {
  createVIPAccountSchema,
  updateVIPAccountSchema,
  vipAccountParamsSchema,
  listVIPAccountQuerySchema,
  type CreateVIPAccountDTO,
  type UpdateVIPAccountDTO,
  type VipAccountParams,
  type ListVIPAccountQuery
}