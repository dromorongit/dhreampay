import { connectDB } from '@/lib/mongodb/client'
import { Transaction, Exception, ReconciliationJob } from '@/models'

export async function GET() {
  await connectDB()

  const totalTransactions = await Transaction.countDocuments()
  const totalMatched = await Transaction.countDocuments({ status: 'MATCHED' })
  const totalExceptions = await Exception.countDocuments({ status: 'OPEN' })
  const totalVIP = await Transaction.countDocuments({ isVIP: true })

  const recentJobs = await ReconciliationJob.find()
    .sort({ startedAt: -1 })
    .limit(5)

  const recentExceptions = await Exception.find({ status: 'OPEN' })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('transactionId')

  return Response.json({
    totalTransactions,
    totalMatched,
    totalExceptions,
    totalVIP,
    recentJobs,
    recentExceptions,
  })
}