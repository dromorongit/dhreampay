import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as userRepository from '../repositories/user.repository.js'
import type { ListUserQuery, CreateUserDTO, UpdateUserDTO } from '../validators/user.validator.js'
import { UserRole } from '../types/user.types.js'

interface UserFilter {
  role?: UserRole
  isActive?: boolean
}

function buildUserFilter(query: ListUserQuery): UserFilter {
  const filter: UserFilter = {}

  if (query.role !== undefined) {
    filter.role = query.role
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive
  }

  return filter
}

async function listUsers(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as ListUserQuery
  const filter = buildUserFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await userRepository.find(filter, { page, limit })

  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  })
}

async function getUserById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const user = await userRepository.findById(objectId)

  if (user === null) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: user
  })
}

async function createUser(req: Request, res: Response): Promise<Response> {
  const body = req.body as CreateUserDTO

  const user = await userRepository.create(body)

  return res.status(201).json({
    success: true,
    data: user
  })
}

async function updateUserById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const body = req.body as UpdateUserDTO
  const objectId = new Types.ObjectId(id)

  const user = await userRepository.updateById(objectId, body)

  if (user === null) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: user
  })
}

async function deactivateUserById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const user = await userRepository.updateById(objectId, { isActive: false })

  if (user === null) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: user,
    message: 'User deactivated successfully'
  })
}

export {
  listUsers,
  getUserById,
  createUser,
  updateUserById,
  deactivateUserById
}
