import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as transactionRepo from '../src/repositories/transaction.repository.js'
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

describe('Transaction Routes', () => {
  describe('GET /api/transactions', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/transactions')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return paginated results with valid token', async () => {
      const token = await getAuthToken('viewer')

      await transactionRepo.create({
        transactionId: 'TXN001',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.pagination.total).toBe(1)
    })

    it('should filter by status correctly', async () => {
      const token = await getAuthToken('viewer')

      await transactionRepo.create({
        transactionId: 'TXN002',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false,
        status: 'matched'
      })

      await transactionRepo.create({
        transactionId: 'TXN003',
        source: 'visa',
        transactionType: 'refund',
        cardNumberMasked: '****5678',
        amount: 50,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH002',
        isVIP: false,
        status: 'unmatched'
      })

      const response = await request(app)
        .get('/api/transactions?status=matched')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].status).toBe('matched')
    })

    it('should filter by source correctly', async () => {
      const token = await getAuthToken('viewer')

      await transactionRepo.create({
        transactionId: 'TXN004',
        source: 'visa',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const response = await request(app)
        .get('/api/transactions?source=visa')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].source).toBe('visa')
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/transactions?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 400 for invalid status enum', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/transactions?status=invalid_status')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/transactions/:id', () => {
    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('viewer')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Transaction not found')
    })

    it('should return transaction by id', async () => {
      const token = await getAuthToken('viewer')

      const transaction = await transactionRepo.create({
        transactionId: 'TXN005',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const response = await request(app)
        .get(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.transactionId).toBe('TXN005')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/transactions/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/transactions/:id', () => {
    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const transaction = await transactionRepo.create({
        transactionId: 'TXN006',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const response = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const transaction = await transactionRepo.create({
        transactionId: 'TXN007',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const response = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should delete transaction as admin and verify removal', async () => {
      const token = await getAuthToken('admin')

      const transaction = await transactionRepo.create({
        transactionId: 'TXN008',
        source: 'bank',
        transactionType: 'purchase',
        cardNumberMasked: '****1234',
        amount: 100,
        transactionDate: new Date(),
        postingDate: new Date(),
        merchantId: 'MERCH001',
        isVIP: false
      })

      const deleteResponse = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.success).toBe(true)
      expect(deleteResponse.body.message).toBe('Transaction deleted successfully')

      const found = await transactionRepo.findById(transaction._id)
      expect(found).toBeNull()
    })

    it('should return 404 when deleting non-existent transaction', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .delete(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Transaction not found')
    })
  })
})