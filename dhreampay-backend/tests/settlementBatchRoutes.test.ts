import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as settlementBatchRepo from '../src/repositories/settlementBatch.repository.js'
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

describe('SettlementBatch Routes', () => {
  describe('GET /api/settlement-batches', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/settlement-batches')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return paginated results with valid token', async () => {
      const token = await getAuthToken('viewer')

      await settlementBatchRepo.create({
        batchId: 'BATCH001',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get('/api/settlement-batches')
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

      await settlementBatchRepo.create({
        batchId: 'BATCH002',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com',
        status: 'completed'
      })

      await settlementBatchRepo.create({
        batchId: 'BATCH003',
        batchDate: new Date(),
        source: 'visa',
        fileName: 'test2.csv',
        uploadedBy: 'admin@example.com',
        status: 'pending'
      })

      const response = await request(app)
        .get('/api/settlement-batches?status=completed')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].status).toBe('completed')
    })

    it('should filter by source correctly', async () => {
      const token = await getAuthToken('viewer')

      await settlementBatchRepo.create({
        batchId: 'BATCH004',
        batchDate: new Date(),
        source: 'visa',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get('/api/settlement-batches?source=visa')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].source).toBe('visa')
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/settlement-batches?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 400 for invalid status enum', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/settlement-batches?status=invalid_status')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/settlement-batches/:id', () => {
    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('viewer')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/settlement-batches/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Settlement batch not found')
    })

    it('should return settlement batch by id', async () => {
      const token = await getAuthToken('viewer')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH005',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get(`/api/settlement-batches/${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.batchId).toBe('BATCH005')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/settlement-batches/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/settlement-batches/:id', () => {
    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH006',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .delete(`/api/settlement-batches/${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH007',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const response = await request(app)
        .delete(`/api/settlement-batches/${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should delete settlement batch as admin and verify removal', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH008',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const deleteResponse = await request(app)
        .delete(`/api/settlement-batches/${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.success).toBe(true)
      expect(deleteResponse.body.message).toBe('Settlement batch deleted successfully')

      const found = await settlementBatchRepo.findById(batch._id)
      expect(found).toBeNull()
    })

    it('should return 404 when deleting non-existent settlement batch', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .delete(`/api/settlement-batches/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Settlement batch not found')
    })
  })
})