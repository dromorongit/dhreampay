import { connectDB } from '../config/database.js'
import mongoose from 'mongoose'
import logger from '../config/logger.js'

const VALID_INDEXES = ['_id_', 'transactionId_1_source_1', 'source_1_status_1']

async function listAndFixIndexes(): Promise<void> {
  await connectDB()
  try {
    const db = mongoose.connection.db
    if (!db) throw new Error('DB not connected')
    const collection = db.collection('transactions')
    const indexes = await collection.indexes()
    logger.info('Current indexes:')
    for (const idx of indexes) {
      logger.info({ name: idx.name, key: idx.key }, 'Index found')
    }
    for (const idx of indexes) {
      if (!VALID_INDEXES.includes(idx.name ?? '')) {
        logger.info({ name: idx.name }, 'Dropping stale index')
        await collection.dropIndex(idx.name ?? '')
        logger.info({ name: idx.name }, 'Dropped successfully')
      }
    }
    logger.info('Done. All stale indexes dropped.')
  } catch (err) {
    logger.error({ err }, 'Error')
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

listAndFixIndexes()