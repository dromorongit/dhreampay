import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'
import * as vipAccountRepo from '../src/repositories/vipAccount.repository.js'
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

describe('VIPAccount Routes', () => {
  describe('GET /api/vip-accounts', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/vip-accounts')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return paginated results for admin role', async () => {
      const token = await getAuthToken('admin')

      await vipAccountRepo.create({
        accountId: 'ACC001',
        cardNumberMasked: '****1234',
        customerName: 'John Doe',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .get('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.pagination.total).toBe(1)
    })

    it('should return paginated results for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      await vipAccountRepo.create({
        accountId: 'ACC002',
        cardNumberMasked: '****5678',
        customerName: 'Jane Smith',
        vipTier: 'gold'
      })

      const response = await request(app)
        .get('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
    })

    it('should return paginated results for viewer role', async () => {
      const token = await getAuthToken('viewer')

      await vipAccountRepo.create({
        accountId: 'ACC003',
        cardNumberMasked: '****9012',
        customerName: 'Bob Wilson',
        vipTier: 'silver'
      })

      const response = await request(app)
        .get('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
    })

    it('should filter by vipTier correctly', async () => {
      const token = await getAuthToken('admin')

      await vipAccountRepo.create({
        accountId: 'ACC004',
        cardNumberMasked: '****1111',
        customerName: 'Alice Platinum',
        vipTier: 'platinum'
      })

      await vipAccountRepo.create({
        accountId: 'ACC005',
        cardNumberMasked: '****2222',
        customerName: 'Charlie Gold',
        vipTier: 'gold'
      })

      const response = await request(app)
        .get('/api/vip-accounts?vipTier=platinum')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].vipTier).toBe('platinum')
    })

    it('should filter by isActive correctly', async () => {
      const token = await getAuthToken('admin')

      await vipAccountRepo.create({
        accountId: 'ACC006',
        cardNumberMasked: '****3333',
        customerName: 'Active User',
        vipTier: 'platinum',
        isActive: true
      })

      await vipAccountRepo.create({
        accountId: 'ACC007',
        cardNumberMasked: '****4444',
        customerName: 'Inactive User',
        vipTier: 'gold',
        isActive: false
      })

      const response = await request(app)
        .get('/api/vip-accounts?isActive=true')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].isActive).toBe(true)
    })

    it('should search by customerName with case-insensitive partial match', async () => {
      const token = await getAuthToken('admin')

      await vipAccountRepo.create({
        accountId: 'ACC008',
        cardNumberMasked: '****5555',
        customerName: 'John Smith',
        vipTier: 'platinum'
      })

      await vipAccountRepo.create({
        accountId: 'ACC009',
        cardNumberMasked: '****6666',
        customerName: 'jane doe',
        vipTier: 'gold'
      })

      const response = await request(app)
        .get('/api/vip-accounts?search=john')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].customerName).toBe('John Smith')
    })

    it('should return 400 for invalid query params', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/vip-accounts?limit=200')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('GET /api/vip-accounts/:id', () => {
    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/vip-accounts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('VIP account not found')
    })

    it('should return VIP account by id for admin', async () => {
      const token = await getAuthToken('admin')

      const account = await vipAccountRepo.create({
        accountId: 'ACC010',
        cardNumberMasked: '****7777',
        customerName: 'Test Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .get(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.accountId).toBe('ACC010')
    })

    it('should return VIP account by id for viewer', async () => {
      const token = await getAuthToken('viewer')

      const account = await vipAccountRepo.create({
        accountId: 'ACC011',
        cardNumberMasked: '****8888',
        customerName: 'Viewer Customer',
        vipTier: 'gold'
      })

      const response = await request(app)
        .get(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.customerName).toBe('Viewer Customer')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/vip-accounts/invalid-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/vip-accounts', () => {
    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC012',
          cardNumberMasked: '****9999',
          customerName: 'Test User',
          vipTier: 'platinum'
        })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC013',
          cardNumberMasked: '****1111',
          customerName: 'Test User',
          vipTier: 'platinum'
        })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should create VIP account as admin with valid data', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC014',
          cardNumberMasked: '****2222',
          customerName: 'New Customer',
          vipTier: 'gold',
          accountManager: 'John Manager'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accountId).toBe('ACC014')
      expect(response.body.data.customerName).toBe('New Customer')
      expect(response.body.data.vipTier).toBe('gold')
      expect(response.body.data.accountManager).toBe('John Manager')
    })

    it('should return 400 with missing required field (customerName)', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC015',
          cardNumberMasked: '****3333',
          vipTier: 'platinum'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 409 with clear message for duplicate accountId', async () => {
      const token = await getAuthToken('admin')

      await vipAccountRepo.create({
        accountId: 'ACC016',
        cardNumberMasked: '****4444',
        customerName: 'Original Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC016',
          cardNumberMasked: '****5555',
          customerName: 'Duplicate Customer',
          vipTier: 'gold'
        })

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('accountId already exists')
    })

    it('should set isActive to true by default', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/vip-accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountId: 'ACC017',
          cardNumberMasked: '****6666',
          customerName: 'Default Active Customer',
          vipTier: 'silver'
        })

      expect(response.status).toBe(201)
      expect(response.body.data.isActive).toBe(true)
    })
  })

  describe('PUT /api/vip-accounts/:id', () => {
    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const account = await vipAccountRepo.create({
        accountId: 'ACC018',
        cardNumberMasked: '****7777',
        customerName: 'Original Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .put(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerName: 'Updated Customer'
        })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const account = await vipAccountRepo.create({
        accountId: 'ACC019',
        cardNumberMasked: '****8888',
        customerName: 'Original Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .put(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerName: 'Updated Customer'
        })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should update VIP account as admin and field should change when re-fetched', async () => {
      const token = await getAuthToken('admin')

      const account = await vipAccountRepo.create({
        accountId: 'ACC020',
        cardNumberMasked: '****9999',
        customerName: 'Original Customer',
        vipTier: 'platinum'
      })

      const updateResponse = await request(app)
        .put(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerName: 'Updated Customer',
          vipTier: 'gold'
        })

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.success).toBe(true)
      expect(updateResponse.body.data.customerName).toBe('Updated Customer')
      expect(updateResponse.body.data.vipTier).toBe('gold')

      const refetchResponse = await request(app)
        .get(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(refetchResponse.status).toBe(200)
      expect(refetchResponse.body.data.customerName).toBe('Updated Customer')
    })

    it('should return 404 when updating non-existent VIP account', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .put(`/api/vip-accounts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerName: 'Updated Customer'
        })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('VIP account not found')
    })
  })

  describe('DELETE /api/vip-accounts/:id', () => {
    it('should return 403 for viewer role', async () => {
      const token = await getAuthToken('viewer')

      const account = await vipAccountRepo.create({
        accountId: 'ACC021',
        cardNumberMasked: '****1111',
        customerName: 'Test Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .delete(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for reconciler role', async () => {
      const token = await getAuthToken('reconciler')

      const account = await vipAccountRepo.create({
        accountId: 'ACC022',
        cardNumberMasked: '****2222',
        customerName: 'Test Customer',
        vipTier: 'platinum'
      })

      const response = await request(app)
        .delete(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should delete VIP account as admin and verify removal', async () => {
      const token = await getAuthToken('admin')

      const account = await vipAccountRepo.create({
        accountId: 'ACC023',
        cardNumberMasked: '****3333',
        customerName: 'Test Customer',
        vipTier: 'platinum'
      })

      const deleteResponse = await request(app)
        .delete(`/api/vip-accounts/${account._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.success).toBe(true)
      expect(deleteResponse.body.message).toBe('VIP account deleted successfully')

      const found = await vipAccountRepo.findById(account._id)
      expect(found).toBeNull()
    })

    it('should return 404 when deleting non-existent VIP account', async () => {
      const token = await getAuthToken('admin')

      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .delete(`/api/vip-accounts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('VIP account not found')
    })
  })
})