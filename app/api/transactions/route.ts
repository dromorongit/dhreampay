import { connectDB } from '@/lib/mongodb/client'
import { Transaction } from '@/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role
  if (userRole === 'VIP_DESK') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = parseInt(url.searchParams.get('limit') || '25', 10)
  const search = url.searchParams.get('search') || ''
  const source = url.searchParams.get('source') || ''
  const status = url.searchParams.get('status') || ''
  const isVIP = url.searchParams.get('isVIP') || ''
  const dateFrom = url.searchParams.get('dateFrom') || ''
  const dateTo = url.searchParams.get('dateTo') || ''

  const query: any = {}

  if (search) {
    query.$or = [
      { transactionRef: { $regex: search, $options: 'i' } },
      { cardHolderName: { $regex: search, $options: 'i' } },
    ]
  }

  if (source) {
    query.source = source
  }

  if (status) {
    query.status = status
  }

  if (isVIP !== '') {
    query.isVIP = isVIP === 'true'
  }

  if (dateFrom || dateTo) {
    query.transactionDate = {}
    if (dateFrom) {
      query.transactionDate.$gte = new Date(dateFrom)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      query.transactionDate.$lte = toDate
    }
  }

  const skip = (page - 1) * limit
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query)
  ])

  const serializedTransactions = transactions.map(t => ({
    ...t,
    _id: t._id?.toString() || '',
    transactionDate: t.transactionDate instanceof Date ? t.transactionDate.toISOString() : t.transactionDate,
    settlementDate: t.settlementDate instanceof Date ? t.settlementDate.toISOString() : t.settlementDate,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  }))

  return Response.json({
    transactions: serializedTransactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  })
}