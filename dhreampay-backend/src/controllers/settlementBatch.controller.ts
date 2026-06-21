import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as settlementBatchRepository from '../repositories/settlementBatch.repository.js'
import { ISettlementBatch } from '../types/settlementBatch.types.js'
import type { SettlementBatchListQuery } from '../validators/settlementBatch.validator.js'

interface SettlementBatchFilter {
  status?: string
  source?: 'bank' | 'visa'
  batchDate?: {
    $gte?: Date
    $lte?: Date
  }
}

function buildSettlementBatchFilter(query: SettlementBatchListQuery): SettlementBatchFilter {
  const filter: SettlementBatchFilter = {}

  if (query.status !== undefined) {
    filter.status = query.status
  }

  if (query.source !== undefined) {
    filter.source = query.source
  }

  if (query.dateFrom !== undefined || query.dateTo !== undefined) {
    filter.batchDate = {}
    if (query.dateFrom !== undefined) {
      filter.batchDate.$gte = new Date(query.dateFrom)
    }
    if (query.dateTo !== undefined) {
      filter.batchDate.$lte = new Date(query.dateTo)
    }
  }

  return filter
}

async function listSettlementBatches(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as SettlementBatchListQuery
  const filter = buildSettlementBatchFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await settlementBatchRepository.find(filter as unknown as Partial<ISettlementBatch>, { page, limit })

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

async function getSettlementBatchById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const batch = await settlementBatchRepository.findById(objectId)

  if (batch === null) {
    return res.status(404).json({
      success: false,
      message: 'Settlement batch not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: batch
  })
}

async function deleteSettlementBatchById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const deleted = await settlementBatchRepository.deleteById(objectId)

  if (deleted === null) {
    return res.status(404).json({
      success: false,
      message: 'Settlement batch not found'
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Settlement batch deleted successfully'
  })
}

export {
  listSettlementBatches,
  getSettlementBatchById,
  deleteSettlementBatchById
}