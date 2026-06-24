import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { runMatchingForBatch, getBatchReconciliationStatus } from '../services/matching/matchingEngine.service.js'
import * as settlementBatchRepository from '../repositories/settlementBatch.repository.js'
import { MatchingSummary } from '../types/matching.types.js'

async function triggerReconciliation(req: Request, res: Response): Promise<Response> {
  const { batchId } = req.body as { batchId: string }
  const performedBy = req.user?.userId ?? 'system'

  let objectId: Types.ObjectId
  try {
    objectId = new Types.ObjectId(batchId)
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid batchId format'
    })
  }

  const batch = await settlementBatchRepository.findById(objectId)
  if (batch === null) {
    return res.status(404).json({
      success: false,
      message: 'Settlement batch not found'
    })
  }

  try {
    const summary: MatchingSummary = await runMatchingForBatch(objectId, performedBy)

    return res.status(200).json({
      success: true,
      data: summary
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Matching failed'
    return res.status(400).json({
      success: false,
      message
    })
  }
}

async function getBatchReconciliationStatusHandler(req: Request, res: Response): Promise<Response> {
  const { batchId } = req.params as { batchId: string }

  let objectId: Types.ObjectId
  try {
    objectId = new Types.ObjectId(batchId)
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid batchId format'
    })
  }

  const batch = await settlementBatchRepository.findById(objectId)

  if (batch === null) {
    return res.status(404).json({
      success: false,
      message: 'Settlement batch not found'
    })
  }

  const status = await getBatchReconciliationStatus(objectId)

  return res.status(200).json({
    success: true,
    data: {
      batch,
      reconciliation: status
    }
  })
}

export {
  triggerReconciliation,
  getBatchReconciliationStatusHandler
}