import { Types } from 'mongoose'
import { AuditLogModel } from '../models/AuditLog.model.js'
import { IAuditLog, CreateAuditLogDTO } from '../types/auditLog.types.js'

interface PaginatedAuditLogs {
  data: IAuditLog[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateAuditLogDTO): Promise<IAuditLog> {
  const log = new AuditLogModel(data)
  return log.save()
}

async function findById(id: Types.ObjectId): Promise<IAuditLog | null> {
  return AuditLogModel.findById(id).exec()
}

async function find(
  filter: Partial<IAuditLog>,
  options: { page?: number; limit?: number }
): Promise<PaginatedAuditLogs> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    AuditLogModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    AuditLogModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

export {
  create,
  findById,
  find
}