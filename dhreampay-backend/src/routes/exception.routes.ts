import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  exceptionListQuerySchema,
  exceptionParamsSchema,
  updateExceptionSchema
} from '../validators/exception.validator.js'
import {
  listExceptions,
  getExceptionById,
  updateExceptionById
} from '../controllers/exception.controller.js'

const exceptionRouter = Router()

exceptionRouter.get(
  '/',
  authMiddleware,
  validate(exceptionListQuerySchema, 'query'),
  authorize('admin', 'reconciler', 'viewer'),
  listExceptions
)

exceptionRouter.get(
  '/:id',
  authMiddleware,
  validate(exceptionParamsSchema, 'params'),
  authorize('admin', 'reconciler', 'viewer'),
  getExceptionById
)

exceptionRouter.put(
  '/:id',
  authMiddleware,
  validate(updateExceptionSchema, 'body'),
  authorize('admin', 'reconciler'),
  updateExceptionById
)

export { exceptionRouter }