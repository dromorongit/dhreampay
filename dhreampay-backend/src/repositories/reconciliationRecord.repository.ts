import { Types } from 'mongoose'
import { ReconciliationRecordModel } from '../models/ReconciliationRecord.model.js'
import { IReconciliationRecord, CreateReconciliationRecordDTO } from '../types/reconciliationRecord.types.js'

interface PaginatedReconciliationRecords {
  data: IReconciliationRecord[]
  total: number
  page: number
  limit: number
}

interface ReconciliationRecordFilter {
  $or?: Array<{ bankTransactionId?: Types.ObjectId; visaTransactionId?: Types.ObjectId }>
  settlementBatchId?: Types.ObjectId | typeof Types.ObjectId
  matchStatus?: string
  matchType?: string
}

async function create(data: CreateReconciliationRecordDTO): Promise<IReconciliationRecord> {
  const record = new ReconciliationRecordModel(data)
  return record.save()
}

async function findById(id: Types.ObjectId): Promise<IReconciliationRecord | null> {
  return ReconciliationRecordModel.findById(id).exec()
}

async function findOne(filter: ReconciliationRecordFilter | Partial<IReconciliationRecord>): Promise<IReconciliationRecord | null> {
  return ReconciliationRecordModel.findOne(filter).exec()
}

async function find(
  filter: Partial<IReconciliationRecord>,
  options: { page?: number; limit?: number }
): Promise<PaginatedReconciliationRecords> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    ReconciliationRecordModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    ReconciliationRecordModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: Partial<IReconciliationRecord>): Promise<IReconciliationRecord | null> {
  return ReconciliationRecordModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<IReconciliationRecord | null> {
  return ReconciliationRecordModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById
}