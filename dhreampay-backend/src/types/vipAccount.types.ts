import { Types } from 'mongoose'

export type VIPTier = 'platinum' | 'gold' | 'silver'

export interface IVIPAccount {
  _id: Types.ObjectId
  accountId: string
  cardNumberMasked: string
  customerName: string
  vipTier: VIPTier
  accountManager?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateVIPAccountDTO {
  accountId: string
  cardNumberMasked: string
  customerName: string
  vipTier: VIPTier
  accountManager?: string
  notes?: string
  isActive?: boolean
}