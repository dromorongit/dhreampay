import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../types/index.js'
import logger from '../config/logger.js'
import { env } from '../config/env.js'

interface CustomError extends Error {
  statusCode?: number
  status?: number
}

function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorResponse> {
  const statusCode = err.statusCode ?? err.status ?? 500
  const message = err.message ?? 'Internal Server Error'

  logger.error({ err, statusCode }, message)

  const response: ErrorResponse = {
    success: false,
    message
  }

  if (env.NODE_ENV !== 'production') {
    response.stack = err.stack
  }

  return res.status(statusCode).json(response)
}

export { errorHandler }