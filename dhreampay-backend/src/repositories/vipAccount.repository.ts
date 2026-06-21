import { Types } from 'mongoose'
import { VIPAccountModel } from '../models/VIPAccount.model.js'
import { IVIPAccount, CreateVIPAccountDTO } from '../types/vipAccount.types.js'

interface PaginatedVIPAccounts {
  data: IVIPAccount[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateVIPAccountDTO): Promise<IVIPAccount> {
  const account = new VIPAccountModel(data)
  return account.save()
}

async function findById(id: Types.ObjectId): Promise<IVIPAccount | null> {
  return VIPAccountModel.findById(id).exec()
}

async function findOne(filter: Partial<IVIPAccount>): Promise<IVIPAccount | null> {
  return VIPAccountModel.findOne(filter).exec()
}

async function find(
  filter: Partial<IVIPAccount>,
  options: { page?: number; limit?: number }
): Promise<PaginatedVIPAccounts> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    VIPAccountModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    VIPAccountModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: Partial<IVIPAccount>): Promise<IVIPAccount | null> {
  return VIPAccountModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<IVIPAccount | null> {
  return VIPAccountModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById
}