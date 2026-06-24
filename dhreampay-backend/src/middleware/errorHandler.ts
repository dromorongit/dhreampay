import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../types/index.js'
import logger from '../config/logger.js'
import { env } from '../config/env.js'

interface CustomError extends Error {
  statusCode?: number
  status?: number
  code?: number
  keyValue?: Record<string, unknown>
}

function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorResponse> {
  if (err.code === 11000 && err.keyValue !== undefined) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    })
  }

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