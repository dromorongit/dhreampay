import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as transactionRepository from '../repositories/transaction.repository.js'
import { ITransaction } from '../types/transaction.types.js'
import type { TransactionListQuery } from '../validators/transaction.validator.js'

interface TransactionFilter {
  status?: string
  source?: 'bank' | 'visa'
  isVIP?: boolean
  transactionDate?: {
    $gte?: Date
    $lte?: Date
  }
}

function buildTransactionFilter(query: TransactionListQuery): TransactionFilter {
  const filter: TransactionFilter = {}

  if (query.status !== undefined) {
    filter.status = query.status
  }

  if (query.source !== undefined) {
    filter.source = query.source
  }

  if (query.isVIP !== undefined) {
    filter.isVIP = query.isVIP
  }

  if (query.dateFrom !== undefined || query.dateTo !== undefined) {
    filter.transactionDate = {}
    if (query.dateFrom !== undefined) {
      filter.transactionDate.$gte = new Date(query.dateFrom)
    }
    if (query.dateTo !== undefined) {
      filter.transactionDate.$lte = new Date(query.dateTo)
    }
  }

  return filter
}

async function listTransactions(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as TransactionListQuery
  const filter = buildTransactionFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await transactionRepository.find(filter as unknown as Partial<ITransaction>, { page, limit })

  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  })
}

async function getTransactionById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const transaction = await transactionRepository.findById(objectId)

  if (transaction === null) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: transaction
  })
}

async function deleteTransactionById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const deleted = await transactionRepository.deleteById(objectId)

  if (deleted === null) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  })
}

export {
  listTransactions,
  getTransactionById,
  deleteTransactionById
}