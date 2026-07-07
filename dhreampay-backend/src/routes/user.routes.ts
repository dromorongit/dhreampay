import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  listUserQuerySchema
} from '../validators/user.validator.js'
import {
  listUsers,
  getUserById,
  createUser,
  updateUserById,
  deactivateUserById
} from '../controllers/user.controller.js'

const userRouter = Router()

userRouter.get(
  '/',
  authMiddleware,
  authorize('admin'),
  validate(listUserQuerySchema, 'query'),
  listUsers
)

userRouter.get(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validate(userParamsSchema, 'params'),
  getUserById
)

userRouter.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validate(createUserSchema, 'body'),
  createUser
)

userRouter.put(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validate(userParamsSchema, 'params'),
  validate(updateUserSchema, 'body'),
  updateUserById
)

userRouter.patch(
  '/:id/deactivate',
  authMiddleware,
  authorize('admin'),
  validate(userParamsSchema, 'params'),
  deactivateUserById
)

export { userRouter }