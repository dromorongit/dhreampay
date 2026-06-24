import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as settlementBatchRepo from '../src/repositories/settlementBatch.repository.js'
import * as reconciliationRecordRepo from '../src/repositories/reconciliationRecord.repository.js'
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

describe('ReconciliationRecord Routes', () => {
  describe('GET /api/reconciliation-records', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/reconciliation-records')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return paginated results with valid token for admin', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH001',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC001',
        settlementBatchId: batch._id
      })

      const response = await request(app)
        .get('/api/reconciliation-records')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.pagination.total).toBe(1)
    })

    it('should return paginated results with valid token for reconciler', async () => {
      const token = await getAuthToken('reconciler')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH002',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC002',
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      const response = await request(app)
        .get('/api/reconciliation-records')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
    })

    it('should return paginated results with valid token for viewer', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/reconciliation-records')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should filter by matchStatus correctly', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH003',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC003',
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC004',
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      const response = await request(app)
        .get('/api/reconciliation-records?matchStatus=matched')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].matchStatus).toBe('matched')
    })

    it('should filter by settlementBatchId correctly', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH004',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      await reconciliationRecordRepo.create({
        recordId: 'REC005',
        settlementBatchId: batch._id,
        matchStatus: 'matched'
      })

      const response = await request(app)
        .get(`/api/reconciliation-records?settlementBatchId=${batch._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/reconciliation-records?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('GET /api/reconciliation-records/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/reconciliation-records/123456789012345678901234')

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/reconciliation-records/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Reconciliation record not found')
    })

    it('should return reconciliation record by id', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH005',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const record = await reconciliationRecordRepo.create({
        recordId: 'REC006',
        settlementBatchId: batch._id,
        matchStatus: 'partial'
      })

      const response = await request(app)
        .get(`/api/reconciliation-records/${record._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.recordId).toBe('REC006')
      expect(response.body.data.matchStatus).toBe('partial')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/reconciliation-records/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/reconciliation-records/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/reconciliation-records/123456789012345678901234')
        .send({ matchStatus: 'matched' })

      expect(response.status).toBe(401)
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH006',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const record = await reconciliationRecordRepo.create({
        recordId: 'REC007',
        settlementBatchId: batch._id
      })

      const response = await request(app)
        .put(`/api/reconciliation-records/${record._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ matchStatus: 'matched' })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should update matchStatus and set reconciledAt when matched', async () => {
      const token = await getAuthToken('admin')

      const batch = await settlementBatchRepo.create({
        batchId: 'BATCH007',
        batchDate: new Date(),
        source: 'bank',
        fileName: 'test.csv',
        uploadedBy: 'admin@example.com'
      })

      const record = await reconciliationRecordRepo.create({
        recordId: 'REC008',
        settlementBatchId: batch._id,
        matchStatus: 'unmatched'
      })

      expect(record.reconciledAt).toBeUndefined()

      const response = await request(app)
        .put(`/api/reconciliation-records/${record._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ matchStatus: 'matched', reconciledBy: 'admin@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.matchStatus).toBe('matched')
      expect(response.body.data.reconciledAt).toBeDefined()
      expect(response.body.data.reconciledBy).toBe('admin@example.com')
    })

    it('should return 404 for non-existent record', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .put(`/api/reconciliation-records/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ matchStatus: 'matched' })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Reconciliation record not found')
    })
  })

  describe('POST /api/reconciliation-records', () => {
    it('should return 404 - route does not exist', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/reconciliation-records')
        .set('Authorization', `Bearer ${token}`)
        .send({ recordId: 'REC009' })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/reconciliation-records/:id', () => {
    it('should return 404 - route does not exist', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .delete('/api/reconciliation-records/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })
})