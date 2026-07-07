import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { env } from './config/env.js'
import { healthRouter } from './routes/health.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { transactionRouter } from './routes/transaction.routes.js'
import { settlementBatchRouter } from './routes/settlementBatch.routes.js'
import { vipAccountRouter } from './routes/vipAccount.routes.js'
import { reconciliationRecordRouter } from './routes/reconciliationRecord.routes.js'
import { exceptionRouter } from './routes/exception.routes.js'
import { auditLogRouter } from './routes/auditLog.routes.js'
import { ingestionRouter } from './routes/ingestion.routes.js'
import { reconciliationRouter } from './routes/reconciliation.routes.js'
import { userRouter } from './routes/user.routes.js'
import { reportingRouter } from './routes/reporting.routes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  credentials: true
}))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/settlement-batches', settlementBatchRouter)
app.use('/api/vip-accounts', vipAccountRouter)
app.use('/api/reconciliation-records', reconciliationRecordRouter)
app.use('/api/exceptions', exceptionRouter)
app.use('/api/audit-logs', auditLogRouter)
app.use('/api/ingestion', ingestionRouter)
app.use('/api/reconciliation', reconciliationRouter)
app.use('/api/reporting', reportingRouter)
app.use('/api/users', userRouter)

app.use(notFound)
app.use(errorHandler)

export { app }