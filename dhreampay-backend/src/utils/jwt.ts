import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Types } from 'mongoose'
import { UserRole } from '../types/user.types.js'

export interface JWTPayload {
  userId: Types.ObjectId
  role: UserRole
}

interface AccessTokenPayload {
  userId: Types.ObjectId
  role: UserRole
}

interface RefreshTokenPayload {
  userId: Types.ObjectId
}

const accessSignOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRY as unknown as SignOptions['expiresIn']
}

const refreshSignOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRY as unknown as SignOptions['expiresIn']
}

function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, accessSignOptions)
}

function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, refreshSignOptions)
}

function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
    return decoded
  } catch {
    throw new Error('Invalid or expired access token')
  }
}

function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
    return decoded
  } catch {
    throw new Error('Invalid or expired refresh token')
  }
}

export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
}