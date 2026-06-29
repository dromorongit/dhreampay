import { connectDB } from '../config/database.js'
import mongoose from 'mongoose'
import logger from '../config/logger.js'

async function dropStaleIndexes() {
  await connectDB()
  try {
    const db = mongoose.connection.db
    if (!db) throw new Error('DB not connected')
    const collection = db.collection('transactions')
    const indexes = await collection.indexes()
    logger.info({ indexes }, 'Current indexes on transactions collection')
    const staleIndex = indexes.find(idx => idx.name === 'transactionRef_1')
    if (staleIndex) {
      await collection.dropIndex('transactionRef_1')
      logger.info('Dropped stale index: transactionRef_1')
    } else {
      logger.info('Stale index transactionRef_1 not found — nothing to drop')
    }
  } catch (err) {
    logger.error({ err }, 'Failed to drop stale index')
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

dropStaleIndexes()