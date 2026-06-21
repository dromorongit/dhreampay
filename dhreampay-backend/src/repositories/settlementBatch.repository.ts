import { Types } from 'mongoose'
import { SettlementBatchModel } from '../models/SettlementBatch.model.js'
import { ISettlementBatch, CreateSettlementBatchDTO } from '../types/settlementBatch.types.js'

interface PaginatedSettlementBatches {
  data: ISettlementBatch[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateSettlementBatchDTO): Promise<ISettlementBatch> {
  const batch = new SettlementBatchModel(data)
  return batch.save()
}

async function findById(id: Types.ObjectId): Promise<ISettlementBatch | null> {
  return SettlementBatchModel.findById(id).exec()
}

async function findOne(filter: Partial<ISettlementBatch>): Promise<ISettlementBatch | null> {
  return SettlementBatchModel.findOne(filter).exec()
}

async function find(
  filter: Partial<ISettlementBatch>,
  options: { page?: number; limit?: number }
): Promise<PaginatedSettlementBatches> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    SettlementBatchModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    SettlementBatchModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: Partial<ISettlementBatch>): Promise<ISettlementBatch | null> {
  return SettlementBatchModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<ISettlementBatch | null> {
  return SettlementBatchModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById
}