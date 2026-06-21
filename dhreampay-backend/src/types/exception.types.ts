import { Types } from 'mongoose'

export type ExceptionType = 'amount_mismatch' | 'missing_bank_record' | 'missing_visa_record' | 'duplicate' | 'date_mismatch' | 'other'
export type Severity = 'low' | 'medium' | 'high'
export type ExceptionStatus = 'open' | 'investigating' | 'resolved' | 'escalated'

export interface IException {
  _id: Types.ObjectId
  exceptionId: string
  reconciliationRecordId: Types.ObjectId
  transactionId?: Types.ObjectId
  exceptionType: ExceptionType
  severity: Severity
  status: ExceptionStatus
  description: string
  assignedTo?: string
  resolvedAt?: Date
  resolutionNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExceptionDTO {
  exceptionId: string
  reconciliationRecordId: Types.ObjectId
  transactionId?: Types.ObjectId
  exceptionType: ExceptionType
  severity?: Severity
  status?: ExceptionStatus
  description: string
  assignedTo?: string
  resolvedAt?: Date
  resolutionNotes?: string
}