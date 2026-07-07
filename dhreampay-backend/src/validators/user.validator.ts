import { z } from 'zod'

const userRoleEnum = z.enum(['admin', 'reconciler', 'viewer'])

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleEnum
})

type CreateUserDTO = z.infer<typeof createUserSchema>

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: userRoleEnum.optional(),
  isActive: z.boolean().optional()
})

type UpdateUserDTO = z.infer<typeof updateUserSchema>

const userParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
})

type UserParams = z.infer<typeof userParamsSchema>

const listUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: userRoleEnum.optional(),
  isActive: z.coerce.boolean().optional()
})

type ListUserQuery = z.infer<typeof listUserQuerySchema>

export {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  listUserQuerySchema,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UserParams,
  type ListUserQuery
}