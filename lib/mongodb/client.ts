import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

const MONGODB_URL = process.env.MONGODB_URL

const cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectDB() {
  if (!MONGODB_URL) {
    throw new Error('Please define MONGODB_URL in your .env file')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    }

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log('MongoDB connected successfully')
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
