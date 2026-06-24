import { Request, Response } from 'express'
import { generateBatchSummary, BatchSummaryReport } from '../services/reporting/reportGenerator.service.js'
import { generateBatchExport } from '../services/reporting/excelExporter.service.js'
import * as auditLogRepository from '../repositories/auditLog.repository.js'
import * as settlementBatchRepository from '../repositories/settlementBatch.repository.js'
import * as reconciliationRecordRepository from '../repositories/reconciliationRecord.repository.js'
import * as exceptionRepository from '../repositories/exception.repository.js'

async function getBatchSummary(req: Request, res: Response): Promise<Response> {
  const { batchId } = req.params as { batchId: string }

  try {
    const summary = await generateBatchSummary(batchId)
    return res.status(200).json({
      success: true,
      data: summary
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate summary'
    const status = message === 'Settlement batch not found' ? 404 : 400
    return res.status(status).json({
      success: false,
      message
    })
  }
}

async function exportBatchReport(req: Request, res: Response): Promise<Response> {
  const { batchId } = req.params as { batchId: string }
  const query = req.query as {
    format?: 'xlsx' | 'csv'
    includeExceptions?: string
    includeUnmatched?: string
  }

  const format = query.format ?? 'xlsx'
  const includeExceptions = query.includeExceptions !== undefined 
    ? query.includeExceptions === 'true' 
    : true
  const includeUnmatched = query.includeUnmatched !== undefined 
    ? query.includeUnmatched === 'true' 
    : true

  try {
    const { buffer, filename, contentType } = await generateBatchExport({
      batchId,
      format,
      includeExceptions,
      includeUnmatched
    })

    await auditLogRepository.create({
      action: 'report.exported',
      entityType: 'SettlementBatch',
      entityId: batchId,
      performedBy: req.user?.userId ?? 'unknown'
    })

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send(buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export report'
    const status = message === 'Settlement batch not found' ? 404 : 400
    return res.status(status).json({
      success: false,
      message
    })
  }
}

async function getDashboardSummary(_req: Request, res: Response): Promise<Response> {
  const batches = await settlementBatchRepository.find({}, {})
  
  const totalBatches = batches.data.length

  let totalTransactions = 0
  let matched = 0
  let unmatched = 0
  let partial = 0
  let exceptions = 0

  for (const batch of batches.data) {
    const records = await reconciliationRecordRepository.find(
      { settlementBatchId: batch._id },
      {}
    )
    totalTransactions = totalTransactions + records.data.length

    for (const record of records.data) {
      if (record.matchStatus === 'matched') {
        matched = matched + 1
      } else if (record.matchStatus === 'unmatched') {
        unmatched = unmatched + 1
      } else if (record.matchStatus === 'partial') {
        partial = partial + 1
      } else if (record.matchStatus === 'exception') {
        exceptions = exceptions + 1
      }
    }
  }

  const allExceptions = await exceptionRepository.find({}, {})
  const openExceptions = allExceptions.data.filter(e => e.status === 'open').length
  const highSeverityExceptions = allExceptions.data.filter(e => e.severity === 'high' && e.status === 'open').length

  const recentBatches = [...batches.data]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(b => ({
      batchId: b.batchId,
      batchDate: b.batchDate,
      source: b.source,
      status: b.status,
      totalCount: b.totalCount,
      totalAmount: b.totalAmount,
      createdAt: b.createdAt
    }))

  const overallMatchRate = totalTransactions > 0 
    ? Math.round((matched / totalTransactions) * 100 * 100) / 100 
    : 0

  return res.status(200).json({
    success: true,
    data: {
      totalBatches,
      totalTransactions,
      overallMatchRate,
      openExceptions,
      highSeverityExceptions,
      recentBatches
    }
  })
}

export {
  getBatchSummary,
  exportBatchReport,
  getDashboardSummary
}