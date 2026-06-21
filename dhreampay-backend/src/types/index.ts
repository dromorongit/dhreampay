export interface HealthResponse {
  success: boolean
  status: string
  db: 'connected' | 'disconnected'
  timestamp: string
}

export interface ErrorResponse {
  success: false
  message: string
  stack?: string
}