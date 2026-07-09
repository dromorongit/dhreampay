import { Types } from 'mongoose'
import { findByEmail, findById, updateById, create, hasAnyAdmin } from '../repositories/user.repository.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { IUser, AuthResponse } from '../types/user.types.js'

async function login(email: string, password: string): Promise<AuthResponse | null> {
  const user = await findByEmail(email)

  if (user === null) {
    return null
  }

  if (user.isActive === false) {
    return null
  }

  const isPasswordValid = await user.comparePassword(password)

  if (isPasswordValid === false) {
    return null
  }

  await updateById(user._id, { lastLoginAt: new Date() })

  const accessToken = signAccessToken({ userId: user._id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user._id })

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

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const payload = verifyRefreshToken(refreshToken)
    const user = await findById(payload.userId)

    if (user === null) {
      return null
    }

    if (user.isActive === false) {
      return null
    }

    return signAccessToken({ userId: user._id, role: user.role })
  } catch {
    return null
  }
}

async function bootstrapRegisterAdmin(name: string, email: string, password: string): Promise<AuthResponse | null> {
  const adminExists = await hasAnyAdmin()

  if (adminExists) {
    return null
  }

  const user = await create({
    name,
    email,
    password,
    role: 'admin'
  })

  const accessToken = signAccessToken({ userId: user._id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user._id })

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

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  }
}

async function getBootstrapStatus(): Promise<boolean> {
  return hasAnyAdmin()
}

export {
  login,
  refreshAccessToken,
  bootstrapRegisterAdmin,
  getBootstrapStatus
}