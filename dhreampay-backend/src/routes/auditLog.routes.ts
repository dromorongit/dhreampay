import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  auditLogListQuerySchema,
  auditLogParamsSchema
} from '../validators/auditLog.validator.js'
import {
  listAuditLogs,
  getAuditLogById
} from '../controllers/auditLog.controller.js'

const auditLogRouter = Router()

auditLogRouter.get(
  '/',
  authMiddleware,
  validate(auditLogListQuerySchema, 'query'),
  authorize('admin'),
  listAuditLogs
)

auditLogRouter.get(
  '/:id',
  authMiddleware,
  validate(auditLogParamsSchema, 'params'),
  authorize('admin'),
  getAuditLogById
)

export { auditLogRouter }