import { connectDB } from '../config/database.js'
import mongoose from 'mongoose'
import logger from '../config/logger.js'
import { SettlementBatchModel } from '../models/SettlementBatch.model.js'
import { TransactionModel } from '../models/Transaction.model.js'

async function cleanupFailedBatches() {
  await connectDB()
  try {
    const failedBatches = await SettlementBatchModel.find({ status: 'failed' })
    logger.info({ count: failedBatches.length }, 'Found failed batches')
    for (const batch of failedBatches) {
      const txResult = await TransactionModel.deleteMany({ settlementBatchId: batch._id })
      logger.info({ batchId: batch.batchId, deletedTransactions: txResult.deletedCount }, 'Deleted transactions for failed batch')
      await SettlementBatchModel.deleteOne({ _id: batch._id })
      logger.info({ batchId: batch.batchId }, 'Deleted failed batch')
    }
    const bankTxCount = await TransactionModel.countDocuments({ source: 'bank' })
    logger.info({ bankTxCount }, 'Remaining bank transactions after cleanup')
    logger.info('Cleanup complete')
  } catch (err) {
    logger.error({ err }, 'Cleanup error')
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

cleanupFailedBatches()