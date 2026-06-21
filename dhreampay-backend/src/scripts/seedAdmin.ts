import { connectDB } from '../config/database.js'
import { env } from '../config/env.js'
import { create, findByEmail } from '../repositories/user.repository.js'

async function seedAdmin(): Promise<void> {
  await connectDB()

  const existingAdmin = await findByEmail(env.SEED_ADMIN_EMAIL)

  if (existingAdmin !== null) {
    console.log(`Admin user ${env.SEED_ADMIN_EMAIL} already exists, skipping`)
    process.exit(0)
  }

  await create({
    name: 'Admin User',
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    isActive: true
  })

  console.log(`Admin user ${env.SEED_ADMIN_EMAIL} created successfully`)
  process.exit(0)
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin user:', error)
  process.exit(1)
})