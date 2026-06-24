import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createVIPAccountSchema,
  updateVIPAccountSchema,
  vipAccountParamsSchema,
  listVIPAccountQuerySchema
} from '../validators/vipAccount.validator.js'
import {
  listVIPAccounts,
  getVIPAccountById,
  createVIPAccount,
  updateVIPAccountById,
  deleteVIPAccountById
} from '../controllers/vipAccount.controller.js'

const vipAccountRouter = Router()

vipAccountRouter.get(
  '/',
  authMiddleware,
  validate(listVIPAccountQuerySchema, 'query'),
  authorize('admin', 'reconciler', 'viewer'),
  listVIPAccounts
)

vipAccountRouter.get(
  '/:id',
  authMiddleware,
  validate(vipAccountParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getVIPAccountById
)

vipAccountRouter.post(
  '/',
  authMiddleware,
  validate(createVIPAccountSchema, 'body'),
  authorize('admin'),
  createVIPAccount
)

vipAccountRouter.put(
  '/:id',
  authMiddleware,
  validate(vipAccountParamsSchema, 'params'),
  validate(updateVIPAccountSchema, 'body'),
  authorize('admin'),
  updateVIPAccountById
)

vipAccountRouter.delete(
  '/:id',
  authMiddleware,
  validate(vipAccountParamsSchema, 'params'),
  authorize('admin'),
  deleteVIPAccountById
)

export { vipAccountRouter }