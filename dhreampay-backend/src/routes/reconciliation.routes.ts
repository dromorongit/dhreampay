import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  triggerReconciliationSchema,
  batchIdParamsSchema
} from '../validators/reconciliation.validator.js'
import {
  triggerReconciliation,
  getBatchReconciliationStatusHandler
} from '../controllers/reconciliation.controller.js'

const reconciliationRouter = Router()

reconciliationRouter.post(
  '/trigger',
  authMiddleware,
  validate(triggerReconciliationSchema, 'body'),
  authorize('admin', 'reconciler'),
  triggerReconciliation
)

reconciliationRouter.get(
  '/status/:batchId',
  authMiddleware,
  validate(batchIdParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getBatchReconciliationStatusHandler
)

export { reconciliationRouter }