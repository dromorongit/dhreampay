import { Types } from 'mongoose'

export type UserRole = 'admin' | 'reconciler' | 'viewer'

export interface IUserBase {
  name: string
  email: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUser extends IUserBase {
  _id: Types.ObjectId
  password: string
  comparePassword(candidate: string): Promise<boolean>
}

export interface IUserResponse extends IUserBase {
  _id: Types.ObjectId
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role?: UserRole
  isActive?: boolean
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  isActive?: boolean
  lastLoginAt?: Date
}

export interface AuthResponse {
  user: IUserResponse
  accessToken: string
  refreshToken: string
}