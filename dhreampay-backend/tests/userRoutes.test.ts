import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import * as userRepo from '../src/repositories/user.repository.js'

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

  const { signAccessToken } = await import('../src/utils/jwt.js')
  const token = signAccessToken({
    userId: user._id,
    role
  })

  return token
}

describe('User Routes', () => {
  describe('GET /api/users', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/users')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })

    it('should return 403 for non-admin role (reconciler)', async () => {
      const token = await getAuthToken('reconciler')

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return 403 for non-admin role (viewer)', async () => {
      const token = await getAuthToken('viewer')

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Insufficient permissions')
    })

    it('should return paginated results for admin role', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
    })

    it('should filter by role correctly', async () => {
      const token = await getAuthToken('admin')

      await userRepo.create({
        name: 'Admin User',
        email: 'admin-created@example.com',
        password: 'password123',
        role: 'admin'
      })

      await userRepo.create({
        name: 'Reconciler User',
        email: 'reconciler-created@example.com',
        password: 'password123',
        role: 'reconciler'
      })

      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].role).toBe('admin')
    })

    it('should filter by isActive correctly', async () => {
      const token = await getAuthToken('admin')

      await userRepo.create({
        name: 'Active User',
        email: 'active-user@example.com',
        password: 'password123',
        isActive: true
      })

      await userRepo.create({
        name: 'Inactive User',
        email: 'inactive-user@example.com',
        password: 'password123',
        isActive: false
      })

      const response = await request(app)
        .get('/api/users?isActive=true')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].isActive).toBe(true)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return 403 for non-admin role', async () => {
      const token = await getAuthToken('reconciler')
      const user = await userRepo.create({
        name: 'Test User',
        email: 'test-user@example.com',
        password: 'password123'
      })

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
    })

    it('should return 404 for non-existent valid ObjectId', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('User not found')
    })

    it('should return user by id for admin without password field', async () => {
      const token = await getAuthToken('admin')
      const user = await userRepo.create({
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'password123',
        role: 'reconciler'
      })

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Test Customer')
      expect(response.body.data.password).toBeUndefined()
    })
  })

  describe('POST /api/users', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'reconciler'
        })

      expect(response.status).toBe(401)
    })

    it('should return 403 for non-admin role', async () => {
      const token = await getAuthToken('reconciler')

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'reconciler'
        })

      expect(response.status).toBe(403)
    })

    it('should create user as admin and return without password', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'reconciler'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New User')
      expect(response.body.data.email).toBe('newuser@example.com')
      expect(response.body.data.role).toBe('reconciler')
      expect(response.body.data.password).toBeUndefined()
    })

    it('should return 400 with missing required field', async () => {
      const token = await getAuthToken('admin')

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Name Only',
          role: 'reconciler'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 409 for duplicate email', async () => {
      const token = await getAuthToken('admin')

      await userRepo.create({
        name: 'Original User',
        email: 'duplicate@example.com',
        password: 'password123'
      })

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Duplicate User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'reconciler'
        })

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('email already exists')
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should return 403 for non-admin role', async () => {
      const token = await getAuthToken('reconciler')
      const user = await userRepo.create({
        name: 'Test User',
        email: 'updatetest@example.com',
        password: 'password123'
      })

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        })

      expect(response.status).toBe(403)
    })

    it('should update user as admin', async () => {
      const token = await getAuthToken('admin')
      const user = await userRepo.create({
        name: 'Test User',
        email: 'updatetest2@example.com',
        password: 'password123',
        role: 'reconciler'
      })

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          role: 'admin'
        })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Updated Name')
      expect(response.body.data.role).toBe('admin')
    })

    it('should return 404 when updating non-existent user', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('User not found')
    })
  })

  describe('PATCH /api/users/:id/deactivate', () => {
    it('should return 403 for non-admin role', async () => {
      const token = await getAuthToken('reconciler')
      const user = await userRepo.create({
        name: 'Test User',
        email: 'deactivatetest@example.com',
        password: 'password123'
      })

      const response = await request(app)
        .patch(`/api/users/${user._id}/deactivate`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
    })

    it('should deactivate user and set isActive to false', async () => {
      const token = await getAuthToken('admin')
      const user = await userRepo.create({
        name: 'Test User',
        email: 'deactivatetest2@example.com',
        password: 'password123',
        isActive: true
      })

      const response = await request(app)
        .patch(`/api/users/${user._id}/deactivate`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.isActive).toBe(false)
    })

    it('should return 404 when deactivating non-existent user', async () => {
      const token = await getAuthToken('admin')
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .patch(`/api/users/${fakeId}/deactivate`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('User not found')
    })
  })
})