import { Request, Response } from 'express'
import { login, refreshAccessToken } from '../services/auth.service.js'
import { findById } from '../repositories/user.repository.js'
import { Types } from 'mongoose'

async function loginHandler(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body

  if (email === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }

  const result = await login(email, password)

  if (result === null) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    })
  }

  return res.status(200).json({
    success: true,
    data: result
  })
}

async function refreshHandler(req: Request, res: Response): Promise<Response> {
  const { refreshToken } = req.body

  if (refreshToken === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    })
  }

  const newAccessToken = await refreshAccessToken(refreshToken)

  if (newAccessToken === null) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }

  return res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken }
  })
}

async function meHandler(req: Request, res: Response): Promise<Response> {
  if (req.user === undefined) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const user = await findById(new Types.ObjectId(req.user.userId))

  if (user === null) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    })
  }

  const userWithoutPassword = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }

  return res.status(200).json({
    success: true,
    data: userWithoutPassword
  })
}

export {
  loginHandler,
  refreshHandler,
  meHandler
}