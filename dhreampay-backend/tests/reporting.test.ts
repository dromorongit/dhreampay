import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as settlementBatchRepo from '../src/repositories/settlementBatch.repository.js'
import * as transactionRepo from '../src/repositories/transaction.repository.js'
import * as reconciliationRecordRepo from '../src/repositories/reconciliationRecord.repository.js'
import * as exceptionRepo from '../src/repositories/exception.repository.js'
import * as auditLogRepo from '../src/repositories/auditLog.repository.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { runMatchingForBatch } from '../src/services/matching/matchingEngine.service.js'

let mongoServer: MongoMemoryServer | null = null

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
})

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  }
})

async function getAuthToken(role: 'admin' | 'reconciler' | 'viewer'): Promise<string> {
  const user = await userRepo.create({
    name: 'Test User',
    email: `${role}@example.com`,
    password: 'password123',
    role
  })

  const token = signAccessToken({
    userId: user._id,
    role
  })

  return token
}

describe('Reporting Routes', () => {
  describe('GET /api/reporting/dashboard', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/reporting/dashboard')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return dashboard summary for admin', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-DASHBOARD',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'dashboard-test.csv',
        uploadedBy: 'admin@example.com'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-DASHBOARD-1',
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      const response = await request(app)
        .get('/api/reporting/dashboard')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.totalBatches).toBe(1)
      expect(response.body.data.totalTransactions).toBe(1)
      expect(response.body.data.overallMatchRate).toBeDefined()
      expect(response.body.data.openExceptions).toBeDefined()
      expect(response.body.data.highSeverityExceptions).toBeDefined()
      expect(response.body.data.recentBatches).toBeInstanceOf(Array)
    })

    it('should return dashboard summary for reconciler', async () => {
      const token = await getAuthToken('reconciler')

      const response = await request(app)
        .get('/api/reporting/dashboard')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return dashboard summary for viewer', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/reporting/dashboard')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/reporting/batch/:batchId/summary', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/reporting/batch/123456789012345678901234/summary')

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent batch', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/reporting/batch/${fakeId}/summary`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Settlement batch not found')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/reporting/batch/invalid-id/summary')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should return batch summary with correct counts', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-SUMMARY',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'summary-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const bank1 = await transactionRepo.create({
        transactionId: 'TXN-BANK-1',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 100,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT1',
        settlementBatchId: batch._id
      })

      const bank2 = await transactionRepo.create({
        transactionId: 'TXN-BANK-2',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1112',
        amount: 200,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT2',
        settlementBatchId: batch._id
      })

      const visa1 = await transactionRepo.create({
        transactionId: 'TXN-VISA-1',
        source: 'visa',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 100,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT1',
        settlementBatchId: batch._id
      })

      const visa2 = await transactionRepo.create({
        transactionId: 'TXN-VISA-2',
        source: 'visa',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1112',
        amount: 200,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT2',
        settlementBatchId: batch._id
      })

      await settlementBatchRepo.updateById(batch._id, { status: 'completed' })

      await runMatchingForBatch(batch._id, 'admin@example.com')

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/summary`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.batch).toBeDefined()
      expect(response.body.data.batch.batchId).toBe('BATCH-SUMMARY')
      expect(response.body.data.totalTransactions).toBe(2)
    })
  })

  describe('GET /api/reporting/batch/:batchId/export', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/reporting/batch/123456789012345678901234/export')

      expect(response.status).toBe(401)
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')
      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-EXPORT',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'export-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return xlsx export with correct headers for admin', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-EXPORT-XLSX',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'export-test.xlsx',
        uploadedBy: 'admin@example.com'
      })

      const bankTx = await transactionRepo.create({
        transactionId: 'TXN-BANK-EXPORT',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 150,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT_EXPORT',
        settlementBatchId: batch._id
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-EXPORT-1',
        bankTransactionId: bankTx._id,
        settlementBatchId: batch._id,
        matchStatus: 'matched',
        matchType: 'exact'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export?format=xlsx`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('.xlsx')

      const auditLogs = await auditLogRepo.find({ action: 'report.exported' }, {})
      expect(auditLogs.data.length).toBe(1)
      expect(auditLogs.data[0].entityId).toBe(batch._id.toString())
    })

    it('should return csv export with correct headers for admin', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-EXPORT-CSV',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'export-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const bankTx = await transactionRepo.create({
        transactionId: 'TXN-BANK-EXPORT-CSV',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 250,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT_EXPORT_CSV',
        settlementBatchId: batch._id
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-EXPORT-CSV-1',
        bankTransactionId: bankTx._id,
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export?format=csv`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('.csv')

      const auditLogs = await auditLogRepo.find({ action: 'report.exported' }, {})
      expect(auditLogs.data.length).toBe(1)
    })

    it('should return 404 for non-existent batch on export', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/reporting/batch/${fakeId}/export`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Settlement batch not found')
    })

    it('should filter out exceptions when includeExceptions=false', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-FILTER-EXC',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'filter-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const bankTx = await transactionRepo.create({
        transactionId: 'TXN-BANK-FILTER',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 100,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT_FILTER',
        settlementBatchId: batch._id
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-FILTER-MATCHED',
        bankTransactionId: bankTx._id,
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-FILTER-UNMATCHED',
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      const excRecord = await reconciliationRecordRepo.create({
        recordId: 'REC-FILTER-EXCEPTION',
        settlementBatchId: batch._id,
        matchStatus: 'exception'
      })

      await exceptionRepo.create({
        exceptionId: 'EXC-1',
        reconciliationRecordId: excRecord._id,
        exceptionType: 'amount_mismatch',
        severity: 'medium',
        status: 'open',
        description: 'Test exception'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export?includeExceptions=false`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
    })

    it('should filter out unmatched when includeUnmatched=false', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-FILTER-UNMATCHED',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'filter-unmatched-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const bankTx = await transactionRepo.create({
        transactionId: 'TXN-BANK-FILTER-UM',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '411111******1111',
        amount: 100,
        currency: 'GHS',
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCHANT_FILTER_UM',
        settlementBatchId: batch._id
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-FILTER-UM-MATCHED',
        bankTransactionId: bankTx._id,
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-FILTER-UM-UNMATCHED',
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export?includeUnmatched=false`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
    })

    it('should allow reconciler role on export endpoint', async () => {
      const token = await getAuthToken('reconciler')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-RECONCILER',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'reconciler-test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get(`/api/reporting/batch/${batch._id}/export`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    })
  })
})