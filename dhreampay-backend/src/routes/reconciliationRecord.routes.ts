import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  reconciliationRecordListQuerySchema,
  reconciliationRecordParamsSchema,
  updateReconciliationSchema
} from '../validators/reconciliationRecord.validator.js'
import {
  listReconciliationRecords,
  getReconciliationRecordById,
  updateReconciliationRecordById
} from '../controllers/reconciliationRecord.controller.js'

const reconciliationRecordRouter = Router()

reconciliationRecordRouter.get(
  '/',
  authMiddleware,
  validate(reconciliationRecordListQuerySchema, 'query'),
  authorize('admin', 'reconciler', 'viewer'),
  listReconciliationRecords
)

reconciliationRecordRouter.get(
  '/:id',
  authMiddleware,
  validate(reconciliationRecordParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getReconciliationRecordById
)

reconciliationRecordRouter.put(
  '/:id',
  authMiddleware,
  validate(updateReconciliationSchema, 'body'),
  authorize('admin', 'reconciler'),
  updateReconciliationRecordById
)

export { reconciliationRecordRouter }