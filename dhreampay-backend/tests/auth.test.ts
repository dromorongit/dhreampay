import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import express from 'express'
import { create } from '../src/repositories/user.repository.js'
import { authMiddleware } from '../src/middleware/auth.middleware.js'
import { authorize } from '../src/middleware/authorize.middleware.js'
import { app } from '../src/app.js'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
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

describe('Auth', () => {
  it('should login with correct credentials and return tokens', async () => {
    await create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'reconciler'
    })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.accessToken).toBeDefined()
    expect(response.body.data.refreshToken).toBeDefined()
    expect(response.body.data.user.email).toBe('test@example.com')
    expect(response.body.data.user.password).toBeUndefined()
  })

  it('should return 401 for wrong password', async () => {
    await create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'reconciler'
    })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Invalid credentials')
  })

  it('should return same generic message for non-existent email as wrong password', async () => {
    const wrongPasswordResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' })

    expect(wrongPasswordResponse.status).toBe(401)
    expect(wrongPasswordResponse.body.message).toBe('Invalid credentials')
  })

  it('should return 401 for GET /api/auth/me without token', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Access token required')
  })

  it('should return user data without password for GET /api/auth/me with valid token', async () => {
    await create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'reconciler'
    })

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    const token = loginResponse.body.data.accessToken

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.success).toBe(true)
    expect(meResponse.body.data.email).toBe('test@example.com')
    expect(meResponse.body.data.password).toBeUndefined()
  })

  it('should return 403 for viewer role accessing admin route', async () => {
    await create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: 'password123',
      role: 'viewer'
    })

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@example.com', password: 'password123' })

    const token = loginResponse.body.data.accessToken

    const testApp = express()
    testApp.use(express.json())

    testApp.get('/admin-test', authMiddleware, authorize('admin'), (_req, res) => {
      res.status(200).json({ success: true })
    })

    const response = await request(testApp)
      .get('/admin-test')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Insufficient permissions')
  })

  it('should return 401 for invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Invalid refresh token')
  })

  it('should return new access token for valid refresh token', async () => {
    await create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'reconciler'
    })

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    const refreshToken = loginResponse.body.data.refreshToken

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })

    expect(refreshResponse.status).toBe(200)
    expect(refreshResponse.body.data.accessToken).toBeDefined()
  })
})

describe('Bootstrap Registration', () => {
  it('GET /api/auth/bootstrap-status returns adminExists: false on fresh database', async () => {
    const response = await request(app)
      .get('/api/auth/bootstrap-status')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.adminExists).toBe(false)
  })

  it('POST /api/auth/bootstrap-register succeeds and returns 201 with accessToken when no admin exists', async () => {
    const response = await request(app)
      .post('/api/auth/bootstrap-register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123'
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.accessToken).toBeDefined()
    expect(response.body.data.refreshToken).toBeDefined()
    expect(response.body.data.user.email).toBe('admin@example.com')
    expect(response.body.data.user.password).toBeUndefined()
    expect(response.body.data.user.role).toBe('admin')
  })

  it('POST /api/auth/bootstrap-register returns 403 after an admin exists', async () => {
    const response = await request(app)
      .post('/api/auth/bootstrap-register')
      .send({
        name: 'Second Admin',
        email: 'second@example.com',
        password: 'password123'
      })

    expect(response.status).toBe(403)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('An admin account already exists. Registration is disabled. Contact your administrator for access.')
  })

  it('GET /api/auth/bootstrap-status returns adminExists: true after first registration', async () => {
    const response = await request(app)
      .get('/api/auth/bootstrap-status')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.adminExists).toBe(true)
  })

  it('bootstrap-register ignores role field and creates admin regardless', async () => {
    const response = await request(app)
      .post('/api/auth/bootstrap-register')
      .send({
        name: 'Role Hacker',
        email: 'hacker@example.com',
        password: 'password123',
        role: 'viewer'
      })

    expect(response.status).toBe(403)
    expect(response.body.message).toBe('An admin account already exists. Registration is disabled. Contact your administrator for access.')
  })
})