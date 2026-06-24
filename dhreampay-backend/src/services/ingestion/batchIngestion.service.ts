import { Types } from 'mongoose'
import { parseFile } from './fileParser.service.js'
import { validateAndMapRow } from './rowValidator.service.js'
import * as transactionRepository from '../../repositories/transaction.repository.js'
import * as settlementBatchRepository from '../../repositories/settlementBatch.repository.js'
import * as auditLogRepository from '../../repositories/auditLog.repository.js'
import { IngestionResult, FileSource, SupportedFileType } from '../../types/ingestion.types.js'
import { CreateTransactionDTO } from '../../types/transaction.types.js'
import { CreateSettlementBatchDTO } from '../../types/settlementBatch.types.js'
import { EntityType } from '../../types/auditLog.types.js'

function generateBatchId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BATCH-${timestamp}-${random}`
}

async function ingestFile(
  buffer: Buffer,
  fileType: SupportedFileType,
  source: FileSource,
  fileName: string,
  uploadedBy: string
): Promise<IngestionResult> {
  let batchId: string
  let batchObjectId: Types.ObjectId | null = null

  try {
    const batchCreateData: CreateSettlementBatchDTO = {
      batchId: generateBatchId(),
      batchDate: new Date(),
      source,
      fileName,
      uploadedBy
    }

    const batch = await settlementBatchRepository.create(batchCreateData)
    batchId = batch.batchId
    batchObjectId = batch._id

    const rawRows = parseFile(buffer, fileType)

    const errors: IngestionResult['errors'] = []
    let successCount = 0
    let totalAmount = 0

    for (let i = 0; i < rawRows.length; i++) {
      const rawRow = rawRows[i]
      const result = validateAndMapRow(rawRow, source)

      if (result.success) {
        const transactionData: CreateTransactionDTO = {
          ...result.data,
          source,
          settlementBatchId: batchObjectId
        }
        await transactionRepository.create(transactionData)
        successCount++
        totalAmount += result.data.amount
      } else {
        errors.push({
          row: i + 1,
          message: result.error
        })
      }
    }

    const status = errors.length === rawRows.length ? 'failed' : 'completed'
    const errorMessage = status === 'failed' ? `All ${errors.length} rows failed validation` : undefined

    await settlementBatchRepository.updateById(batchObjectId, {
      totalAmount,
      totalCount: successCount,
      status,
      errorMessage
    })

    const entityType: EntityType = 'SettlementBatch'
    await auditLogRepository.create({
      action: 'batch.ingested',
      entityType,
      entityId: batchId,
      performedBy: uploadedBy,
      changes: {
        totalRows: rawRows.length,
        successCount,
        errorCount: errors.length,
        totalAmount,
        status
      }
    })

    return {
      batchId,
      totalRows: rawRows.length,
      successCount,
      errorCount: errors.length,
      errors
    }
  } catch (error) {
    if (batchObjectId !== null) {
      await settlementBatchRepository.updateById(batchObjectId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during ingestion'
      })
    }
    throw error
  }
}

export { ingestFile }