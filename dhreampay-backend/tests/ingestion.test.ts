import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import * as XLSX from 'xlsx'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as settlementBatchRepo from '../src/repositories/settlementBatch.repository.js'
import * as transactionRepo from '../src/repositories/transaction.repository.js'
import * as auditLogRepo from '../src/repositories/auditLog.repository.js'
import { signAccessToken } from '../src/utils/jwt.js'

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

function createBankCsvBuffer(): Buffer {
  const data = [
    {
      transaction_id: 'BANK-TXN-001',
      card_number: '1234',
      amount: '100.50',
      currency: 'GHS',
      transaction_date: '2024-01-15',
      posting_date: '2024-01-16',
      merchant_id: 'MERCH-001',
      terminal_id: 'TERM-001',
      auth_code: 'AUTH-001',
      transaction_type: 'purchase',
      is_vip: 'false'
    },
    {
      transaction_id: 'BANK-TXN-002',
      card_number: '5678',
      amount: '200.00',
      currency: 'GHS',
      transaction_date: '2024-01-17',
      posting_date: '2024-01-18',
      merchant_id: 'MERCH-002',
      terminal_id: '',
      auth_code: '',
      transaction_type: 'refund',
      is_vip: 'false'
    },
    {
      transaction_id: 'BANK-TXN-003',
      card_number: '9999',
      amount: '300.75',
      currency: 'GHS',
      transaction_date: '2024-01-19',
      posting_date: '2024-01-20',
      merchant_id: 'MERCH-003',
      terminal_id: '',
      auth_code: '',
      transaction_type: 'reversal',
      is_vip: 'true'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  return Buffer.from(csv, 'utf-8')
}

function createVisaXlsxBuffer(): Buffer {
  const data = [
    {
      transaction_id: 'VISA-TXN-001',
      card_number: '4321',
      amount: '500.00',
      currency: 'USD',
      transaction_date: '2024-02-01',
      posting_date: '2024-02-02',
      merchant_id: 'MERCH-VISA-001',
      terminal_id: 'TERM-VISA-001',
      auth_code: 'VISA-AUTH-001',
      transaction_type: 'purchase'
    },
    {
      transaction_id: 'VISA-TXN-002',
      card_number: '8765',
      amount: '750.25',
      currency: 'USD',
      transaction_date: '2024-02-03',
      posting_date: '2024-02-04',
      merchant_id: 'MERCH-VISA-002',
      terminal_id: '',
      auth_code: '',
      transaction_type: 'adjustment',
      is_vip: 'true'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  const binaryString = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' })
  const buffer = Buffer.from(binaryString, 'binary')
  return buffer
}

function createMixedCsvBuffer(): Buffer {
  const data = [
    {
      transaction_id: 'MIXED-TXN-001',
      card_number: '1111',
      amount: '100.00',
      currency: 'GHS',
      transaction_date: '2024-03-01',
      posting_date: '2024-03-02',
      merchant_id: 'MERCH-MIXED-001',
      transaction_type: 'purchase'
    },
    {
      card_number: '2222',
      amount: '200.00',
      currency: 'GHS',
      transaction_date: '2024-03-03',
      posting_date: '2024-03-04',
      merchant_id: 'MERCH-MIXED-002',
      transaction_type: 'refund'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  return Buffer.from(csv, 'utf-8')
}

describe('Ingestion Routes', () => {
  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ingestion/upload')
        .field('source', 'bank')
        .attach('file', Buffer.from('test'), 'test.csv')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')
      const csvBuffer = createBankCsvBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'bank')
        .attach('file', csvBuffer, 'bank.csv')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Insufficient permissions')
    })
  })

  describe('File Upload', () => {
    it('should return 400 for non-CSV/XLSX file type', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'bank')
        .attach('file', Buffer.from('test content'), 'test.txt')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid file type. Only .csv and .xlsx files are supported')
    })

    it('should return 400 if source is missing in body', async () => {
      const token = await getAuthToken('admin')
      const csvBuffer = createBankCsvBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', csvBuffer, 'bank.csv')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Bank CSV Ingestion', () => {
    it('should create one SettlementBatch and 3 Transactions with valid bank CSV', async () => {
      const token = await getAuthToken('admin')
      const csvBuffer = createBankCsvBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'bank')
        .attach('file', csvBuffer, 'bank_settlement.csv')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.successCount).toBe(3)
      expect(response.body.data.errorCount).toBe(0)

      const batches = await settlementBatchRepo.find({}, {})
      expect(batches.total).toBe(1)

      const transactions = await transactionRepo.find({}, {})
      expect(transactions.total).toBe(3)
    })
  })

  describe('Visa XLSX Ingestion', () => {
    it('should create one SettlementBatch and 2 Transactions with valid visa XLSX', async () => {
      const token = await getAuthToken('reconciler')
      const xlsxBuffer = createVisaXlsxBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'visa')
        .attach('file', xlsxBuffer, 'visa_settlement.xlsx')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.successCount).toBe(2)
      expect(response.body.data.errorCount).toBe(0)

      const transactions = await transactionRepo.find({}, {})
      expect(transactions.total).toBe(2)

      const txn0 = transactions.data[0]
      expect(txn0.source).toBe('visa')
    })
  })

  describe('Partial Success Handling', () => {
    it('should return partial results with successCount 1 and errorCount 1', async () => {
      const token = await getAuthToken('admin')
      const mixedBuffer = createMixedCsvBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'bank')
        .attach('file', mixedBuffer, 'mixed.csv')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.successCount).toBe(1)
      expect(response.body.data.errorCount).toBe(1)
      expect(response.body.data.errors.length).toBe(1)
      expect(response.body.data.errors[0].row).toBe(2)

      const batch = await settlementBatchRepo.findOne({ batchId: response.body.data.batchId })
      expect(batch?.status).toBe('completed')
      expect(batch?.totalAmount).toBe(100)
    })
  })

  describe('AuditLog', () => {
    it('should create an AuditLog entry for each ingestion', async () => {
      const token = await getAuthToken('admin')
      const csvBuffer = createBankCsvBuffer()

      const response = await request(app)
        .post('/api/ingestion/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('source', 'bank')
        .attach('file', csvBuffer, 'bank_settlement.csv')

      const logs = await auditLogRepo.find({}, {})
      const ingestionLog = logs.data.find((log) => log.action === 'batch.ingested')

      expect(ingestionLog).toBeDefined()
      expect(ingestionLog?.entityType).toBe('SettlementBatch')
      expect(ingestionLog?.changes?.totalRows).toBe(3)
      expect(ingestionLog?.changes?.successCount).toBe(3)
    })
  })
})