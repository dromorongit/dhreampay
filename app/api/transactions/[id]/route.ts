import { connectDB } from '@/lib/mongodb/client'
import { Transaction, AuditLog } from '@/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import mongoose from 'mongoose'

async function checkRole(roles: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 }
  }
  const userRole = (session.user as any).role
  if (!roles.includes(userRole)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { session, userRole }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await checkRole(['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'])
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  await connectDB()

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return Response.json({ error: 'Invalid transaction ID' }, { status: 400 })
  }

  const transaction = await Transaction.findById(params.id).lean()

  if (!transaction) {
    return Response.json({ error: 'Transaction not found' }, { status: 404 })
  }

  const serialized = {
    ...transaction,
    _id: transaction._id?.toString() || '',
    createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
    transactionDate: transaction.transactionDate instanceof Date ? transaction.transactionDate.toISOString() : transaction.transactionDate,
    settlementDate: transaction.settlementDate instanceof Date ? transaction.settlementDate.toISOString() : transaction.settlementDate,
  }

  return Response.json(serialized)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await checkRole(['ADMIN'])
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  await connectDB()

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return Response.json({ error: 'Invalid transaction ID' }, { status: 400 })
  }

  const transaction = await Transaction.findByIdAndDelete(params.id)

  if (!transaction) {
    return Response.json({ error: 'Transaction not found' }, { status: 404 })
  }

  await AuditLog.create({
    userId: new mongoose.Types.ObjectId((auth.session.user as any).id),
    action: 'DELETED_TRANSACTION',
    entity: 'Transaction',
    entityId: params.id,
    details: `Deleted transaction ${transaction.transactionRef}`,
  })

  return Response.json({ success: true })
}