import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  batchSummaryParamsSchema,
  exportParamsSchema,
  exportQuerySchema
} from '../validators/reporting.validator.js'
import {
  getBatchSummary,
  exportBatchReport,
  getDashboardSummary
} from '../controllers/reporting.controller.js'

const reportingRouter = Router()

reportingRouter.get(
  '/dashboard',
  authMiddleware,
  authorize('admin', 'reconciler', 'viewer'),
  getDashboardSummary
)

reportingRouter.get(
  '/batch/:batchId/summary',
  authMiddleware,
  validate(batchSummaryParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getBatchSummary
)

reportingRouter.get(
  '/batch/export',
  authMiddleware,
  validate(exportQuerySchema, 'query'),
  authorize('admin', 'reconciler'),
  exportBatchReport
)

export { reportingRouter }