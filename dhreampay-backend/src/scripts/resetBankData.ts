import { connectDB } from '../config/database.js'
import mongoose from 'mongoose'
import logger from '../config/logger.js'
import { TransactionModel } from '../models/Transaction.model.js'
import { SettlementBatchModel } from '../models/SettlementBatch.model.js'

async function resetBankData() {
  await connectDB()
  try {
    const txResult = await TransactionModel.deleteMany({ source: 'bank' })
    logger.info({ deleted: txResult.deletedCount }, 'Deleted all bank transactions')
    const batchResult = await SettlementBatchModel.deleteMany({ source: 'bank' })
    logger.info({ deleted: batchResult.deletedCount }, 'Deleted all bank batches')
    logger.info('Reset complete. Ready for fresh bank CSV upload.')
  } catch (err) {
    logger.error({ err }, 'Reset error')
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

resetBankData()