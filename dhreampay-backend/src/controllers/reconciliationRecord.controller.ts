import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as reconciliationRecordRepository from '../repositories/reconciliationRecord.repository.js'
import { IReconciliationRecord, MatchStatus } from '../types/reconciliationRecord.types.js'
import type { ReconciliationRecordListQuery, UpdateReconciliationBody } from '../validators/reconciliationRecord.validator.js'

interface ReconciliationRecordFilter {
  matchStatus?: MatchStatus
  settlementBatchId?: Types.ObjectId
}

function buildReconciliationRecordFilter(query: ReconciliationRecordListQuery): ReconciliationRecordFilter {
  const filter: ReconciliationRecordFilter = {}

  if (query.matchStatus !== undefined) {
    filter.matchStatus = query.matchStatus
  }

  if (query.settlementBatchId !== undefined) {
    filter.settlementBatchId = new Types.ObjectId(query.settlementBatchId)
  }

  return filter
}

async function listReconciliationRecords(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as ReconciliationRecordListQuery
  const filter = buildReconciliationRecordFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await reconciliationRecordRepository.find(
    filter as unknown as Partial<IReconciliationRecord>,
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

async function getReconciliationRecordById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const record = await reconciliationRecordRepository.findById(objectId)

  if (record === null) {
    return res.status(404).json({
      success: false,
      message: 'Reconciliation record not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: record
  })
}

async function updateReconciliationRecordById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)
  const body = req.body as unknown as UpdateReconciliationBody

  const existing = await reconciliationRecordRepository.findById(objectId)

  if (existing === null) {
    return res.status(404).json({
      success: false,
      message: 'Reconciliation record not found'
    })
  }

  const updateData: Partial<IReconciliationRecord> = { ...body }

  if (body.matchStatus === 'matched') {
    updateData.reconciledAt = new Date()
  }

  const updated = await reconciliationRecordRepository.updateById(objectId, updateData)

  if (updated === null) {
    return res.status(404).json({
      success: false,
      message: 'Reconciliation record not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: updated
  })
}

export {
  listReconciliationRecords,
  getReconciliationRecordById,
  updateReconciliationRecordById
}