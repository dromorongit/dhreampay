import { Request } from 'express'
import { UserRole } from '../types/user.types.js'

declare module 'express' {
  interface Request {
    user?: {
      userId: string
      role: UserRole
    }
  }
}