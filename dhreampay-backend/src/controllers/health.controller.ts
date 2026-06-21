import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { HealthResponse } from '../types/index.js'

function getHealth(_req: Request, res: Response): Response<HealthResponse> {
  const isDbConnected = mongoose.connection.readyState === 1
  const dbStatus: 'connected' | 'disconnected' = isDbConnected ? 'connected' : 'disconnected'

  return res.status(200).json({
    success: true,
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString()
  })
}

export { getHealth }