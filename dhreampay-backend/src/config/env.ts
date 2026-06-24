import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().transform((val) => {
    if (!val) return undefined
    const parsed = parseInt(val, 10)
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid PORT value: ${val}`)
    }
    return parsed
  }).pipe(z.number().int().min(1).max(65535).optional()),
  MONGODB_URI: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  AMOUNT_TOLERANCE: z.coerce.number().default(0.01),
  DATE_WINDOW_DAYS: z.coerce.number().int().default(1),
  CORS_ORIGIN: z.string().default('*')
})

type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.errors.map((e) => {
      const path = e.path.join('.')
      const message = e.message
      return `  - ${path}: ${message}`
    }).join('\n')
    
    console.error(`Environment validation failed. Missing or invalid variables:\n${missingVars}`)
  } else {
    console.error('Environment validation failed:', error)
  }
  process.exit(1)
}

export { env }