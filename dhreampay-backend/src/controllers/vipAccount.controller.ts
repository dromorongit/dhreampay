import { Request, Response } from 'express'
import { Types } from 'mongoose'
import * as vipAccountRepository from '../repositories/vipAccount.repository.js'
import { IVIPAccount } from '../types/vipAccount.types.js'
import type { ListVIPAccountQuery, CreateVIPAccountDTO, UpdateVIPAccountDTO } from '../validators/vipAccount.validator.js'

interface VipAccountFilter {
  vipTier?: string
  isActive?: boolean
  customerName?: { $regex: string; $options: string }
}

function buildVipAccountFilter(query: ListVIPAccountQuery): VipAccountFilter {
  const filter: VipAccountFilter = {}

  if (query.vipTier !== undefined) {
    filter.vipTier = query.vipTier
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive
  }

  if (query.search !== undefined && query.search !== '') {
    filter.customerName = {
      $regex: query.search,
      $options: 'i'
    }
  }

  return filter
}

async function listVIPAccounts(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as ListVIPAccountQuery
  const filter = buildVipAccountFilter(query)

  const page = query.page
  const limit = query.limit

  const result = await vipAccountRepository.find(filter as unknown as Partial<IVIPAccount>, { page, limit })

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

async function getVIPAccountById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const account = await vipAccountRepository.findById(objectId)

  if (account === null) {
    return res.status(404).json({
      success: false,
      message: 'VIP account not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: account
  })
}

async function createVIPAccount(req: Request, res: Response): Promise<Response> {
  const body = req.body as CreateVIPAccountDTO

  const account = await vipAccountRepository.create(body)

  return res.status(201).json({
    success: true,
    data: account
  })
}

async function updateVIPAccountById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const body = req.body as UpdateVIPAccountDTO
  const objectId = new Types.ObjectId(id)

  const account = await vipAccountRepository.updateById(objectId, body)

  if (account === null) {
    return res.status(404).json({
      success: false,
      message: 'VIP account not found'
    })
  }

  return res.status(200).json({
    success: true,
    data: account
  })
}

async function deleteVIPAccountById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params
  const objectId = new Types.ObjectId(id)

  const deleted = await vipAccountRepository.deleteById(objectId)

  if (deleted === null) {
    return res.status(404).json({
      success: false,
      message: 'VIP account not found'
    })
  }

  return res.status(200).json({
    success: true,
    message: 'VIP account deleted successfully'
  })
}

export {
  listVIPAccounts,
  getVIPAccountById,
  createVIPAccount,
  updateVIPAccountById,
  deleteVIPAccountById
}