import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
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

describe('AuditLog Routes', () => {
  describe('GET /api/audit-logs', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/audit-logs')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const response = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return paginated results for admin', async () => {
      const token = await getAuthToken('admin')

      await auditLogRepo.create({
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: '123',
        performedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.pagination.total).toBe(1)
    })

    it('should filter by entityType correctly', async () => {
      const token = await getAuthToken('admin')

      await auditLogRepo.create({
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: '123',
        performedBy: 'admin@example.com'
      })

      await auditLogRepo.create({
        action: 'UPDATE',
        entityType: 'SettlementBatch',
        entityId: '456',
        performedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get('/api/audit-logs?entityType=Transaction')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].entityType).toBe('Transaction')
    })

    it('should filter by entityId correctly', async () => {
      const token = await getAuthToken('admin')

      await auditLogRepo.create({
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: 'ENTITY123',
        performedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get('/api/audit-logs?entityId=ENTITY123')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].entityId).toBe('ENTITY123')
    })

    it('should filter by performedBy correctly', async () => {
      const token = await getAuthToken('admin')

      await auditLogRepo.create({
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: '789',
        performedBy: 'specific@example.com'
      })

      const response = await request(app)
        .get('/api/audit-logs?performedBy=specific@example.com')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].performedBy).toBe('specific@example.com')
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/audit-logs?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/audit-logs/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/audit-logs/123456789012345678901234')

      expect(response.status).toBe(401)
    })

    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/audit-logs/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
    })

    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/audit-logs/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Audit log not found')
    })

    it('should return audit log by id', async () => {
      const token = await getAuthToken('admin')

      const log = await auditLogRepo.create({
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: 'LOG123',
        performedBy: 'admin@example.com'
      })

      const response = await request(app)
        .get(`/api/audit-logs/${log._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.action).toBe('CREATE')
      expect(response.body.data.entityId).toBe('LOG123')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/audit-logs/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/audit-logs', () => {
    it('should return 404 - route does not exist', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/audit-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'CREATE', entityType: 'Transaction', entityId: '123' })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/audit-logs/:id', () => {
    it('should return 404 - route does not exist', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .put('/api/audit-logs/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'UPDATE' })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/audit-logs/:id', () => {
    it('should return 404 - route does not exist', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .delete('/api/audit-logs/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })
})