import { app } from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/database.js'

async function startServer(): Promise<void> {
  await connectDB()
  const port = (() => {
    if (process.env.PORT) {
      const parsed = parseInt(process.env.PORT, 10)
      if (!Number.isNaN(parsed)) return parsed
    }
    return env.PORT ?? 3001
  })()
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

startServer()