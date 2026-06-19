import { Role } from '../constants'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role?: Role
      image?: string | null
    }
  }

  interface JWT {
    id?: string
    role?: Role
  }
}

export interface User {
  id: string
  email: string
  name: string | null
  role: Role
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  status: TransactionStatus
  type: TransactionType
  createdAt: Date
  updatedAt: Date
  reference: string
}

export interface Reconciliation {
  id: string
  transactionId: string
  expectedAmount: number
  actualAmount: number
  difference: number
  status: ReconciliationStatus
  notes?: string
  createdAt: Date
  resolvedAt?: Date
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  TRANSFER = 'TRANSFER',
  VISA_CARD = 'VISA_CARD',
  VIP = 'VIP',
}

export enum ReconciliationStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  DISCREPANCY = 'DISCREPANCY',
  RESOLVED = 'RESOLVED',
}