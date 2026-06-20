import { connectDB } from '@/lib/mongodb/client'
import { Transaction } from '@/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'RECONCILIATION_OFFICER' && userRole !== 'AUDITOR') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const batches = await Transaction.aggregate([
    {
      $group: {
        _id: '$batchId',
        source: { $first: '$source' },
        totalRecords: { $sum: 1 },
        uploadDate: { $max: '$createdAt' },
      }
    },
    { $sort: { uploadDate: -1 } }
  ])

  return Response.json(batches.map(b => ({
    batchId: b._id,
    source: b.source,
    totalRecords: b.totalRecords,
    uploadDate: b.uploadDate instanceof Date ? b.uploadDate.toISOString() : b.uploadDate
  })))
}