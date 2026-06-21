import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { healthRouter } from './routes/health.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { transactionRouter } from './routes/transaction.routes.js'
import { settlementBatchRouter } from './routes/settlementBatch.routes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/settlement-batches', settlementBatchRouter)

app.use(notFound)
app.use(errorHandler)

export { app }