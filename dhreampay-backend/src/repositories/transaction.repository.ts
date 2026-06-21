import { Types } from 'mongoose'
import { TransactionModel } from '../models/Transaction.model.js'
import { ITransaction, CreateTransactionDTO } from '../types/transaction.types.js'

interface PaginatedTransactions {
  data: ITransaction[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateTransactionDTO): Promise<ITransaction> {
  const transaction = new TransactionModel(data)
  return transaction.save()
}

async function findById(id: Types.ObjectId): Promise<ITransaction | null> {
  return TransactionModel.findById(id).exec()
}

async function findOne(filter: Partial<ITransaction>): Promise<ITransaction | null> {
  return TransactionModel.findOne(filter).exec()
}

async function find(
  filter: Partial<ITransaction>,
  options: { page?: number; limit?: number }
): Promise<PaginatedTransactions> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    TransactionModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    TransactionModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: Partial<ITransaction>): Promise<ITransaction | null> {
  return TransactionModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<ITransaction | null> {
  return TransactionModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById
}