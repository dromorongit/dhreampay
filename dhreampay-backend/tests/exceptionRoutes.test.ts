import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as reconciliationRecordRepo from '../src/repositories/reconciliationRecord.repository.js'
import * as exceptionRepo from '../src/repositories/exception.repository.js'
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

async function createTestRecord(): Promise<mongoose.Types.ObjectId> {
  const batch = await settlementBatchRepo.create({
    batchId: 'BATCH001',
    batchDate: new Date(),
    source: 'bank',
    fileName: 'test.csv',
    uploadedBy: 'admin@example.com'
  })

  const record = await reconciliationRecordRepo.create({
    recordId: 'REC001',
    settlementBatchId: batch._id
  })

  return record._id
}

describe('Exception Routes', () => {
  describe('GET /api/exceptions', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/exceptions')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return paginated results with valid token for admin', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      await exceptionRepo.create({
        exceptionId: 'EX001',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception'
      })

      const response = await request(app)
        .get('/api/exceptions')
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

      const response = await request(app)
        .get('/api/exceptions')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return paginated results with valid token for viewer', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/exceptions')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should filter by status correctly', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      await exceptionRepo.create({
        exceptionId: 'EX002',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'open'
      })

      await exceptionRepo.create({
        exceptionId: 'EX003',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'resolved'
      })

      const response = await request(app)
        .get('/api/exceptions?status=open')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].status).toBe('open')
    })

    it('should filter by severity correctly', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      await exceptionRepo.create({
        exceptionId: 'EX004',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        severity: 'high'
      })

      const response = await request(app)
        .get('/api/exceptions?severity=high')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].severity).toBe('high')
    })

    it('should filter by exceptionType correctly', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      await exceptionRepo.create({
        exceptionId: 'EX005',
        reconciliationRecordId: recordId,
        exceptionType: 'missing_bank_record',
        description: 'Test exception'
      })

      const response = await request(app)
        .get('/api/exceptions?exceptionType=missing_bank_record')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].exceptionType).toBe('missing_bank_record')
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/exceptions?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/exceptions/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/exceptions/123456789012345678901234')

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/exceptions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Exception not found')
    })

    it('should return exception by id', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX006',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception'
      })

      const response = await request(app)
        .get(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.exceptionId).toBe('EX006')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/exceptions/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/exceptions/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/exceptions/123456789012345678901234')
        .send({ status: 'investigating' })

      expect(response.status).toBe(401)
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX007',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'open'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'investigating' })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should succeed for valid status transition (open -> investigating)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX008',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'open'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'investigating' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('investigating')
    })

    it('should return 422 for invalid status transition (open -> resolved)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX009',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'open'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' })

      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid status transition from open to resolved')
    })

    it('should return 422 for invalid status transition (open -> escalated)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX010',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'open'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'escalated' })

      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid status transition from open to escalated')
    })

    it('should succeed for valid status transition (investigating -> resolved)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX011',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'investigating'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('resolved')
    })

    it('should succeed for valid status transition (investigating -> escalated)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX012',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'investigating'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'escalated' })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('escalated')
    })

    it('should succeed for valid status transition (escalated -> resolved)', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX013',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'escalated'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('resolved')
    })

    it('should set resolvedAt when status is resolved', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX014',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception',
        status: 'investigating'
      })

      expect(exception.resolvedAt).toBeUndefined()

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved', resolutionNotes: 'Fixed' })

      expect(response.status).toBe(200)
      expect(response.body.data.resolvedAt).toBeDefined()
      expect(response.body.data.resolutionNotes).toBe('Fixed')
    })

    it('should return 404 for non-existent exception', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .put(`/api/exceptions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Exception not found')
    })

    it('should allow updating assignedTo without status change', async () => {
      const token = await getAuthToken('admin')

      const recordId = await createTestRecord()

      const exception = await exceptionRepo.create({
        exceptionId: 'EX015',
        reconciliationRecordId: recordId,
        exceptionType: 'amount_mismatch',
        description: 'Test exception'
      })

      const response = await request(app)
        .put(`/api/exceptions/${exception._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: 'reconciler@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.data.assignedTo).toBe('reconciler@example.com')
    })
  })
})