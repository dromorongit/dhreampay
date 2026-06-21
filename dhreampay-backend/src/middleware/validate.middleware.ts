import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type SourceType = 'query' | 'body' | 'params'

interface FormattedError {
  path: string
  message: string
}

function formatZodError(error: ZodError): FormattedError[] {
  return error.errors.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message
  }))
}

function validate(schema: ZodSchema, source: SourceType) {
  return function (req: Request, res: Response, next: NextFunction): Response | void {
    const input = req[source]
    const result = schema.safeParse(input)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatZodError(result.error)
      })
    }

    req[source] = result.data
    next()
  }
}

export { validate }