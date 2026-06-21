import pino from 'pino'
import { env } from './env.js'

const isProduction = env.NODE_ENV === 'production'

const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})

export default logger