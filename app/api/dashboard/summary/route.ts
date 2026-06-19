import { connectDB } from '@/lib/mongodb/client'
import { Transaction, Exception, ReconciliationJob } from '@/models'

const serializeDate = (date: Date | string | undefined | null): string | undefined =>
  date ? (date instanceof Date ? date.toISOString() : date) : undefined

export async function GET() {
  await connectDB()

  const totalTransactions = await Transaction.countDocuments()
  const totalMatched = await Transaction.countDocuments({ status: 'MATCHED' })
  const totalExceptions = await Exception.countDocuments({ status: 'OPEN' })
  const totalVIP = await Transaction.countDocuments({ isVIP: true })

  const recentJobs = await ReconciliationJob.find()
    .sort({ startedAt: -1 })
    .limit(5)
    .lean()

  const recentExceptions = await Exception.find({ status: 'OPEN' })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const data = {
    totalTransactions,
    totalMatched,
    totalExceptions,
    totalVIP,
    recentJobs: recentJobs.map(job => ({
      _id: job._id?.toString() || '',
      jobName: job.jobName || '',
      status: job.status,
      totalTransactions: job.totalTransactions || 0,
      totalMatched: job.totalMatched || 0,
      totalUnmatched: job.totalUnmatched || 0,
      totalVIP: job.totalVIP || 0,
      startedAt: serializeDate(job.startedAt),
      completedAt: serializeDate(job.completedAt),
      triggeredBy: job.triggeredBy?.toString() || '',
    })),
    recentExceptions: recentExceptions.map(exc => ({
      _id: exc._id?.toString() || '',
      transactionId: exc.transactionId?.toString() || '',
      exceptionType: exc.exceptionType,
      reason: exc.reason || '',
      severity: exc.severity,
      status: exc.status,
      resolvedBy: exc.resolvedBy?.toString(),
      resolutionNote: exc.resolutionNote,
      resolvedAt: serializeDate(exc.resolvedAt),
      reconciliationJobId: exc.reconciliationJobId?.toString() || '',
    })),
  }

  return Response.json(JSON.parse(JSON.stringify(data)))
}