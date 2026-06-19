import bcrypt from 'bcryptjs'
import { connectDB } from '../lib/mongodb/client.js'
import { User } from '../models/User.js'

async function seed() {
  await connectDB()

  const existingAdmin = await User.findOne({ email: 'admin@dhreampay.com' })

  if (existingAdmin) {
    console.log('Admin user already exists')
    process.exit(0)
  }

  const hashedPassword = await bcrypt.hash('Admin', 10)

  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@dhreampay.com',
    password: hashedPassword,
    role: 'ADMIN',
  })

  console.log(`Admin user created: ${admin.email}`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed error:', error)
  process.exit(1)
})