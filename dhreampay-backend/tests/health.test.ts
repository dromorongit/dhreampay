import request from 'supertest'
import { app } from '../src/app.js'

describe('GET /api/health', () => {
  it('should return 200 status with success: true', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.status).toBe('ok')
    expect(['connected', 'disconnected']).toContain(response.body.db)
    expect(typeof response.body.timestamp).toBe('string')
  })
})