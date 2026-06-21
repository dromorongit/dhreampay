import { Request, Response, NextFunction } from 'express'

function notFound(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: 'Not Found'
  })
}

export { notFound }