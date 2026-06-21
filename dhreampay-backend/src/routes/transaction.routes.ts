import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { transactionListQuerySchema, transactionParamsSchema } from '../validators/transaction.validator.js'
import {
  listTransactions,
  getTransactionById,
  deleteTransactionById
} from '../controllers/transaction.controller.js'

const transactionRouter = Router()

transactionRouter.get(
  '/',
  authMiddleware,
  validate(transactionListQuerySchema, 'query'),
  authorize('admin', 'reconciler', 'viewer'),
  listTransactions
)

transactionRouter.get(
  '/:id',
  authMiddleware,
  validate(transactionParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getTransactionById
)

transactionRouter.delete(
  '/:id',
  authMiddleware,
  validate(transactionParamsSchema, 'params'),
  authorize('admin'),
  deleteTransactionById
)

export { transactionRouter }