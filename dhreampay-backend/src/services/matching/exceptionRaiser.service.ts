import { Types } from 'mongoose'
import * as exceptionRepository from '../../repositories/exception.repository.js'
import * as auditLogRepository from '../../repositories/auditLog.repository.js'
import { IException, CreateExceptionDTO, ExceptionType, Severity } from '../../types/exception.types.js'

interface RaiseExceptionParams {
  reconciliationRecordId: Types.ObjectId
  transactionId: Types.ObjectId | undefined
  exceptionType: ExceptionType
  severity: Severity
  description: string
  performedBy: string
}

async function raiseException(params: RaiseExceptionParams): Promise<IException> {
  const { reconciliationRecordId, transactionId, exceptionType, severity, description, performedBy } = params

  const exceptionData: CreateExceptionDTO = {
    exceptionId: `EXC-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    reconciliationRecordId,
    transactionId,
    exceptionType,
    severity,
    status: 'open',
    description
  }

  const exception = await exceptionRepository.create(exceptionData)

  await auditLogRepository.create({
    action: 'exception.raised',
    entityType: 'Exception',
    entityId: exception._id.toString(),
    performedBy
  })

  return exception
}

export { raiseException }