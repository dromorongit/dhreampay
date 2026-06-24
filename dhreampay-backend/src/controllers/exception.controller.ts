import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as exceptionRepository from '../repositories/exception.repository.js'
import { IException, ExceptionStatus } from '../types/exception.types.js'
import type { ExceptionListQuery, UpdateExceptionBody } from '../validators/exception.validator.js'

const validStatusTransitions: Record<ExceptionStatus, ExceptionStatus[]> = {
  open: ['investigating'],
  investigating: ['resolved', 'escalated'],
  escalated: ['resolved'],
  resolved: []
}

function validateStatusTransition(currentStatus: ExceptionStatus, newStatus: ExceptionStatus): boolean {
  const allowedNextStatuses = validStatusTransitions[currentStatus]
  return allowedNextStatuses.includes(newStatus)
}

interface ExceptionFilter {
  status?: ExceptionStatus
  severity?: string
  exceptionType?: string
}

function buildExceptionFilter(query: ExceptionListQuery): ExceptionFilter {
  const filter: ExceptionFilter = {}

  if (query.status !== undefined) {
    filter.status = query.status
  }

  if (query.severity !== undefined) {
    filter.severity = query.severity
  }

  if (query.exceptionType !== undefined) {
    filter.exceptionType = query.exceptionType
  }

  return filter
}

async function listExceptions(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as ExceptionListQuery
  const filter = buildExceptionFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await exceptionRepository.find(
    filter as unknown as Partial<IException>,
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

async function getExceptionById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const exception = await exceptionRepository.findById(objectId)

  if (exception === null) {
    return res.status(404).json({
      success: false,
      message: 'Exception not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: exception
  })
}

async function updateExceptionById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)
  const body = req.body as unknown as UpdateExceptionBody

  const existing = await exceptionRepository.findById(objectId)

  if (existing === null) {
    return res.status(404).json({
      success: false,
      message: 'Exception not found'
    })
  }

  if (body.status !== undefined) {
    const currentStatus = existing.status
    const newStatus = body.status

    if (!validateStatusTransition(currentStatus, newStatus)) {
      return res.status(422).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`
      })
    }

    const updateData: Partial<IException> = { ...body }

    if (newStatus === 'resolved') {
      updateData.resolvedAt = new Date()
    }

    const updated = await exceptionRepository.updateById(objectId, updateData)

    if (updated === null) {
      return res.status(404).json({
        success: false,
        message: 'Exception not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: updated
    })
  }

  const updated = await exceptionRepository.updateById(objectId, body)

  if (updated === null) {
    return res.status(404).json({
      success: false,
      message: 'Exception not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: updated
  })
}

export {
  listExceptions,
  getExceptionById,
  updateExceptionById
}