import mongoose from 'mongoose'
import { env } from './env.js'
import logger from './logger.js'

async function connectDB(): Promise<void> {
  const maxRetries = 5
  const retryDelayMs = 3000
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const connection = await mongoose.connect(env.MONGODB_URI)
      const dbName = connection.connection.db?.databaseName ?? 'unknown'
      logger.info(`Connected to MongoDB: ${dbName}`)
      return
    } catch (error) {
      attempts += 1
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`MongoDB connection attempt ${attempts} failed: ${errorMessage}`)
      
      if (attempts >= maxRetries) {
        logger.error('Max retries reached. Exiting.')
        process.exit(1)
      }
      
      logger.info(`Retrying in ${retryDelayMs}ms...`)
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }
}

export { connectDB }