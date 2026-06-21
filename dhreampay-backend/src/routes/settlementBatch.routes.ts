import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  settlementBatchListQuerySchema,
  settlementBatchParamsSchema
} from '../validators/settlementBatch.validator.js'
import {
  listSettlementBatches,
  getSettlementBatchById,
  deleteSettlementBatchById
} from '../controllers/settlementBatch.controller.js'

const settlementBatchRouter = Router()

settlementBatchRouter.get(
  '/',
  authMiddleware,
  validate(settlementBatchListQuerySchema, 'query'),
  authorize('admin', 'reconciler', 'viewer'),
  listSettlementBatches
)

settlementBatchRouter.get(
  '/:id',
  authMiddleware,
  validate(settlementBatchParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getSettlementBatchById
)

settlementBatchRouter.delete(
  '/:id',
  authMiddleware,
  validate(settlementBatchParamsSchema, 'params'),
  authorize('admin'),
  deleteSettlementBatchById
)

export { settlementBatchRouter }