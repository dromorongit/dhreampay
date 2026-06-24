import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as auditLogRepository from '../repositories/auditLog.repository.js'
import { IAuditLog } from '../types/auditLog.types.js'
import type { AuditLogListQuery } from '../validators/auditLog.validator.js'

interface AuditLogFilter {
  entityType?: string
  entityId?: string
  performedBy?: string
  createdAt?: {
    $gte?: Date
    $lte?: Date
  }
}

function buildAuditLogFilter(query: AuditLogListQuery): AuditLogFilter {
  const filter: AuditLogFilter = {}

  if (query.entityType !== undefined) {
    filter.entityType = query.entityType
  }

  if (query.entityId !== undefined) {
    filter.entityId = query.entityId
  }

  if (query.performedBy !== undefined) {
    filter.performedBy = query.performedBy
  }

  if (query.dateFrom !== undefined || query.dateTo !== undefined) {
    filter.createdAt = {}
    if (query.dateFrom !== undefined) {
      filter.createdAt.$gte = new Date(query.dateFrom)
    }
    if (query.dateTo !== undefined) {
      filter.createdAt.$lte = new Date(query.dateTo)
    }
  }

  return filter
}

async function listAuditLogs(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as AuditLogListQuery
  const filter = buildAuditLogFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await auditLogRepository.find(
    filter as unknown as Partial<IAuditLog>,
    { page, limit }
  )

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

async function getAuditLogById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const log = await auditLogRepository.findById(objectId)

  if (log === null) {
    return res.status(404).json({
      success: false,
      message: 'Audit log not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: log
  })
}

export {
  listAuditLogs,
  getAuditLogById
}