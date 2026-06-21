import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader === undefined) {
    return null
  }
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

function authMiddleware(req: Request, res: Response, next: NextFunction): Response | void {
  const token = extractTokenFromHeader(req)

  if (token === null) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    })
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      userId: payload.userId.toString(),
      role: payload.role
    }
    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    })
  }
}

export { authMiddleware }