import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { create, findById, findOne } from '../src/repositories/transaction.repository.js'
import { TransactionModel } from '../src/models/Transaction.model.js'
import { create as createBatch, findById as findBatchById } from '../src/repositories/settlementBatch.repository.js'
import { SettlementBatchModel } from '../src/models/SettlementBatch.model.js'
import { create as createVIP, findById as findVIPById } from '../src/repositories/vipAccount.repository.js'
import { VIPAccountModel } from '../src/models/VIPAccount.model.js'

let mongoServer: MongoMemoryServer | null = null

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})

describe('Transaction Repository', () => {
  it('should create a transaction successfully', async () => {
    const transaction = await create({
      transactionId: 'TXN-001',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100.50,
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      merchantId: 'MERCH-001'
    })

    expect(transaction.transactionId).toBe('TXN-001')
    expect(transaction.source).toBe('bank')
    expect(transaction.amount).toBe(100.50)
    expect(transaction.currency).toBe('GHS')
    expect(transaction.isVIP).toBe(false)
    expect(transaction.status).toBe('unmatched')
  })

  it('should reject creation when required field is missing', async () => {
    await expect(create({
      transactionId: '',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100,
      transactionDate: new Date(),
      postingDate: new Date(),
      merchantId: 'MERCH-001'
    })).rejects.toThrow()
  })

  it('should enforce unique index on transactionId within same source', async () => {
    await create({
      transactionId: 'TXN-DUP',
      source: 'bank',
      transactionType: 'purchase',
      cardNumberMasked: '1234',
      amount: 100,
      transactionDate: new Date(),
      postingDate: new Date(),
      merchantId: 'MERCH-001'
    })

    await expect(create({
      transactionId: 'TXN-DUP',
      source: 'bank',
      transactionType: 'refund',
      cardNumberMasked: '5678',
      amount: 50,
      transactionDate: new Date(),
      postingDate: new Date(),
      merchantId: 'MERCH-002'
    })).rejects.toThrow()
  })

  it('should return null for non-existent valid ObjectId', async () => {
    const result = await findById(new mongoose.Types.ObjectId())
    expect(result).toBeNull()
  })
})

describe('SettlementBatch Repository', () => {
  it('should create a settlement batch successfully', async () => {
    const batch = await createBatch({
      batchId: 'BATCH-001',
      batchDate: new Date('2024-01-15'),
      source: 'bank',
      fileName: 'bank_settlement.csv',
      uploadedBy: 'admin'
    })

    expect(batch.batchId).toBe('BATCH-001')
    expect(batch.source).toBe('bank')
    expect(batch.status).toBe('pending')
    expect(batch.totalAmount).toBe(0)
    expect(batch.totalCount).toBe(0)
  })
})

describe('VIPAccount Repository', () => {
  it('should create a VIP account successfully', async () => {
    const account = await createVIP({
      accountId: 'VIP-001',
      cardNumberMasked: '1234',
      customerName: 'John Doe',
      vipTier: 'platinum'
    })

    expect(account.accountId).toBe('VIP-001')
    expect(account.customerName).toBe('John Doe')
    expect(account.vipTier).toBe('platinum')
    expect(account.isActive).toBe(true)
  })
})