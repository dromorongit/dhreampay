import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../types/user.types.js'

function authorize(...allowedRoles: UserRole[]) {
  return function (req: Request, res: Response, next: NextFunction): Response | void {
    if (req.user === undefined) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

export { authorize }