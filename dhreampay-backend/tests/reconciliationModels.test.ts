import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { create as createReconciliation } from '../src/repositories/reconciliationRecord.repository.js'
import { ReconciliationRecordModel } from '../src/models/ReconciliationRecord.model.js'
import { create as createException } from '../src/repositories/exception.repository.js'
import { ExceptionModel } from '../src/models/Exception.model.js'
import { create as createAuditLog } from '../src/repositories/auditLog.repository.js'
import { AuditLogModel } from '../src/models/AuditLog.model.js'

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

describe('ReconciliationRecord Model', () => {
  it('should create a reconciliation record successfully', async () => {
    const record = await createReconciliation({
      recordId: 'REC-001',
      settlementBatchId: new mongoose.Types.ObjectId()
    })

    expect(record.recordId).toBe('REC-001')
    expect(record.matchStatus).toBe('unmatched')
  })

  it('should enforce unique index on recordId', async () => {
    await createReconciliation({
      recordId: 'REC-DUP',
      settlementBatchId: new mongoose.Types.ObjectId()
    })

    await expect(createReconciliation({
      recordId: 'REC-DUP',
      settlementBatchId: new mongoose.Types.ObjectId()
    })).rejects.toThrow()
  })
})

describe('Exception Model', () => {
  it('should create an exception successfully', async () => {
    const exception = await createException({
      exceptionId: 'EXC-001',
      reconciliationRecordId: new mongoose.Types.ObjectId(),
      exceptionType: 'amount_mismatch',
      description: 'Test exception'
    })

    expect(exception.exceptionId).toBe('EXC-001')
    expect(exception.severity).toBe('medium')
    expect(exception.status).toBe('open')
  })

  it('should reject creation when required field description is missing', async () => {
    await expect(createException({
      exceptionId: 'EXC-002',
      reconciliationRecordId: new mongoose.Types.ObjectId(),
      exceptionType: 'other',
      description: ''
    })).rejects.toThrow()
  })

  it('should enforce unique index on exceptionId', async () => {
    await createException({
      exceptionId: 'EXC-DUP',
      reconciliationRecordId: new mongoose.Types.ObjectId(),
      exceptionType: 'other',
      description: 'First exception'
    })

    await expect(createException({
      exceptionId: 'EXC-DUP',
      reconciliationRecordId: new mongoose.Types.ObjectId(),
      exceptionType: 'other',
      description: 'Second exception'
    })).rejects.toThrow()
  })
})

describe('AuditLog Model', () => {
  it('should create an audit log successfully', async () => {
    const log = await createAuditLog({
      action: 'transaction.create',
      entityType: 'Transaction',
      entityId: 'test-id-123',
      performedBy: 'admin'
    })

    expect(log.action).toBe('transaction.create')
    expect(log.entityType).toBe('Transaction')
    expect(log.createdAt).toBeDefined()
  })
})