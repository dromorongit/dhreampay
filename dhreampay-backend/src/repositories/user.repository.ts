import { Types } from 'mongoose'
import { UserModel } from '../models/User.model.js'
import { IUser, CreateUserDTO, UpdateUserDTO } from '../types/user.types.js'

interface PaginatedUsers {
  data: IUser[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateUserDTO): Promise<IUser> {
  const user = new UserModel(data)
  return user.save()
}

async function findById(id: Types.ObjectId): Promise<IUser | null> {
  return UserModel.findById(id).exec()
}

async function findByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email }).select('+password').exec()
}

async function hasAnyAdmin(): Promise<boolean> {
  const count = await UserModel.countDocuments({ role: 'admin' }).exec()
  return count > 0
}

async function find(
  filter: Partial<IUser>,
  options: { page?: number; limit?: number }
): Promise<PaginatedUsers> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    UserModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    UserModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: UpdateUserDTO): Promise<IUser | null> {
  return UserModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<IUser | null> {
  return UserModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findByEmail,
  find,
  updateById,
  deleteById,
  hasAnyAdmin
}