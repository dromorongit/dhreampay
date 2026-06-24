import mongoose, { Types } from 'mongoose'
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
import { exactMatch, fuzzyMatch, calculateAmountDifference, datesWithinWindow } from '../src/services/matching/matchingStrategies.js'
import { runMatchingForBatch } from '../src/services/matching/matchingEngine.service.js'
import { ITransaction } from '../src/types/transaction.types.js'

let mongoServer: MongoMemoryServer | null = null

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
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

describe('Matching Strategies', () => {
  describe('calculateAmountDifference', () => {
    it('should return absolute difference between amounts', () => {
      const bankTx = { amount: 100.50 } as ITransaction
      const visaTx = { amount: 100.25 } as ITransaction

      const diff = calculateAmountDifference(bankTx, visaTx)

      expect(diff).toBe(0.25)
    })

    it('should return 0 for same amounts', () => {
      const bankTx = { amount: 100.00 } as ITransaction
      const visaTx = { amount: 100.00 } as ITransaction

      const diff = calculateAmountDifference(bankTx, visaTx)

      expect(diff).toBe(0)
    })
  })

  describe('datesWithinWindow', () => {
    it('should return true when dates are within window', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-16')

      const result = datesWithinWindow(date1, date2, 1)

      expect(result).toBe(true)
    })

    it('should return false when dates are outside window', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-17')

      const result = datesWithinWindow(date1, date2, 1)

      expect(result).toBe(false)
    })
  })

  describe('exactMatch', () => {
    it('should return true when transactionId matches and amount is within tolerance', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        amount: 100.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-001',
        amount: 100.005,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = exactMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(true)
    })

    it('should return false when transactionId does not match', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        amount: 100.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-002',
        amount: 100.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = exactMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(false)
    })

    it('should return false when amount differs beyond tolerance', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        amount: 100.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-001',
        amount: 101.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = exactMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(false)
    })
  })

  describe('fuzzyMatch', () => {
    it('should return true when authorizationCode matches', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        authorizationCode: 'AUTH-123',
        merchantId: 'MERCH-001',
        amount: 50.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-002',
        authorizationCode: 'AUTH-123',
        merchantId: 'MERCH-002',
        amount: 50.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = fuzzyMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(true)
    })

    it('should return true when merchantId matches, amount within tolerance, and date within window', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        merchantId: 'MERCH-001',
        amount: 100.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-002',
        merchantId: 'MERCH-001',
        amount: 100.005,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = fuzzyMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(true)
    })

    it('should return false when authorizationCode and merchantId do not match', () => {
      const bankTx = {
        transactionId: 'TXN-001',
        authorizationCode: 'AUTH-123',
        merchantId: 'MERCH-001',
        amount: 50.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction
      const visaTx = {
        transactionId: 'TXN-002',
        authorizationCode: 'AUTH-456',
        merchantId: 'MERCH-002',
        amount: 55.00,
        transactionDate: new Date('2024-01-15')
      } as ITransaction

      const result = fuzzyMatch(bankTx, visaTx, 0.01, 1)

      expect(result).toBe(false)
    })
  })
})

describe('Matching Engine Service', () => {
  it('should match all transactions with exact matches', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-MATCH-001',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    const bankTx1 = await transactionRepo.create({
      transactionId: 'TXN-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    const bankTx2 = await transactionRepo.create({
      transactionId: 'TXN-002',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '5678',
      amount: 200.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-002',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    const visaTx1 = await transactionRepo.create({
      transactionId: 'TXN-001',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      status: 'unmatched'
    })

    const visaTx2 = await transactionRepo.create({
      transactionId: 'TXN-002',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '5678',
      amount: 200.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-002',
      status: 'unmatched'
    })

    const summary = await runMatchingForBatch(batch._id, 'admin@example.com')

    expect(summary.matched).toBe(2)
    expect(summary.exceptions).toBe(0)
    expect(summary.unmatched).toBe(0)
  })

  it('should match transactions with fuzzy match (authorizationCode)', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-MATCH-002',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    const bankTx = await transactionRepo.create({
      transactionId: 'TXN-FUZZY-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 150.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      authorizationCode: 'AUTH-123',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    const visaTx = await transactionRepo.create({
      transactionId: 'TXN-FUZZY-002',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 150.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-002',
      authorizationCode: 'AUTH-123',
      status: 'unmatched'
    })

    const summary = await runMatchingForBatch(batch._id, 'admin@example.com')

    expect(summary.matched).toBe(1)
    expect(summary.exceptions).toBe(0)
  })

  it('should create exception for missing visa record', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-MATCH-003',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    await transactionRepo.create({
      transactionId: 'TXN-MISSING-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    const summary = await runMatchingForBatch(batch._id, 'admin@example.com')

    expect(summary.unmatched).toBe(1)
    expect(summary.exceptions).toBe(1)

    const exceptions = await exceptionRepo.find({}, {})
    expect(exceptions.data.length).toBe(1)
    expect(exceptions.data[0].exceptionType).toBe('missing_visa_record')

    const auditLogs = await auditLogRepo.find({}, {})
    const hasExceptionLog = auditLogs.data.some(log => log.action === 'exception.raised')
    expect(hasExceptionLog).toBe(true)
  })

  it('should create exception for unmatched transaction', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-MATCH-004',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    const bankTx = await transactionRepo.create({
      transactionId: 'TXN-AMOUNT-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      authorizationCode: 'AUTH-AMOUNT',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    await transactionRepo.create({
      transactionId: 'TXN-AMOUNT-002',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.50,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      status: 'unmatched'
    })

    const summary = await runMatchingForBatch(batch._id, 'admin@example.com')

    expect(summary.unmatched).toBe(1)
    expect(summary.exceptions).toBe(1)

    const exceptions = await exceptionRepo.find({}, {})
    expect(exceptions.data.length).toBe(1)
    expect(exceptions.data[0].exceptionType).toBe('missing_visa_record')
  })

  it('should raise exception for date mismatch when amounts match but dates outside window', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-DATE-MISMATCH',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    await transactionRepo.create({
      transactionId: 'TXN-DATE-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    await transactionRepo.create({
      transactionId: 'TXN-DATE-001-V',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-20'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      authorizationCode: 'AUTH-DATE',
      status: 'unmatched'
    })

    const summary = await runMatchingForBatch(batch._id, 'admin@example.com')

    expect(summary.unmatched).toBe(1)
    expect(summary.exceptions).toBe(1)

    const exceptions = await exceptionRepo.find({}, {})
    expect(exceptions.data.length).toBe(1)
    expect(exceptions.data[0].exceptionType).toBe('date_mismatch')
  })

  it('should be idempotent - running twice creates no duplicate records', async () => {
    const batch = await settlementBatchRepo.create({
      batchId: 'BATCH-MATCH-005',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin@example.com',
      status: 'completed'
    })

    await transactionRepo.create({
      transactionId: 'TXN-IDEM-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      settlementBatchId: batch._id,
      status: 'unmatched'
    })

    await transactionRepo.create({
      transactionId: 'TXN-IDEM-001-V',
      source: 'visa',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.00,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001',
      status: 'unmatched'
    })

    await runMatchingForBatch(batch._id, 'admin@example.com')

    const recordsAfterFirst = await reconciliationRecordRepo.find({ settlementBatchId: batch._id as unknown as Types.ObjectId }, {})
    expect(recordsAfterFirst.total).toBe(1)

    await runMatchingForBatch(batch._id, 'admin@example.com')

    const recordsAfterSecond = await reconciliationRecordRepo.find({ settlementBatchId: batch._id as unknown as Types.ObjectId }, {})
    expect(recordsAfterSecond.total).toBe(1)
  })
})

describe('Reconciliation Routes', () => {
  describe('POST /api/reconciliation/trigger', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/reconciliation/trigger')
        .send({ batchId: '507f1f77bcf86cd799439011' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .post('/api/reconciliation/trigger')
        .set('Authorization', `Bearer ${token}`)
        .send({ batchId: '507f1f77bcf86cd799439011' })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 400 for invalid batchId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/reconciliation/trigger')
        .set('Authorization', `Bearer ${token}`)
        .send({ batchId: 'invalid-id' })

      expect(response.status).toBe(400)
    })

    it('should return 404 for non-existent batch', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .post('/api/reconciliation/trigger')
        .set('Authorization', `Bearer ${token}`)
        .send({ batchId: fakeId.toString() })

      expect(response.status).toBe(404)
    })

    it('should run matching and return summary for admin', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-ROUTE-001',
        batchDate: new Date('2024-01-15'),
        source: 'bank',
        fileName: 'bank_settlement.csv',
        uploadedBy: 'admin@example.com',
        status: 'completed'
      })

      await transactionRepo.create({
        transactionId: 'TXN-ROUTE-001',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '1234',
        amount: 100.00,
        transactionDate: new Date('2024-01-15'),
        postingDate: new Date('2024-01-16'),
        merchantId: 'MERCH-001',
        settlementBatchId: batch._id,
        status: 'unmatched'
      })

      await transactionRepo.create({
        transactionId: 'TXN-ROUTE-001-V',
        source: 'visa',
        transactionType: 'purchase',
        cardNumberMasked: '1234',
        amount: 100.00,
        transactionDate: new Date('2024-01-15'),
        postingDate: new Date('2024-01-16'),
        merchantId: 'MERCH-001',
        status: 'unmatched'
      })

      const response = await request(app)
        .post('/api/reconciliation/trigger')
        .set('Authorization', `Bearer ${token}`)
        .send({ batchId: batch._id.toString() })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.matched).toBe(1)
    })
  })

  describe('GET /api/reconciliation/status/:batchId', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/reconciliation/status/507f1f77bcf86cd799439011')

      expect(response.status).toBe(401)
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/reconciliation/status/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid batchId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/reconciliation/status/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
    })

    it('should return batch reconciliation status', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH-STATUS-001',
        batchDate: new Date('2024-01-15'),
        source: 'bank',
        fileName: 'bank_settlement.csv',
        uploadedBy: 'admin@example.com',
        status: 'completed'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-STATUS-001',
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC-STATUS-002',
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      const response = await request(app)
        .get(`/api/reconciliation/status/${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.reconciliation.matched).toBe(1)
      expect(response.body.data.reconciliation.unmatched).toBe(1)
    })
  })
})