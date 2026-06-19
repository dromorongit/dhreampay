import { connectDB } from '@/lib/mongodb/client'
import { Transaction, Exception, ReconciliationJob } from '@/models'

const serializeDate = (date: Date | string | undefined) =>
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
    .populate('transactionId')
    .lean()

  return Response.json({
    totalTransactions,
    totalMatched,
    totalExceptions,
    totalVIP,
    recentJobs: recentJobs.map(job => ({
      _id: job._id.toString(),
      jobName: job.jobName,
      status: job.status,
      totalTransactions: job.totalTransactions,
      totalMatched: job.totalMatched,
      totalUnmatched: job.totalUnmatched,
      totalVIP: job.totalVIP,
      startedAt: serializeDate(job.startedAt),
      completedAt: serializeDate(job.completedAt),
      triggeredBy: job.triggeredBy.toString(),
    })),
    recentExceptions: recentExceptions.map(exc => ({
      _id: exc._id.toString(),
      transactionId: typeof exc.transactionId === 'string' ? exc.transactionId : exc.transactionId?._id?.toString() || '',
      exceptionType: exc.exceptionType,
      reason: exc.reason,
      severity: exc.severity,
      status: exc.status,
      resolvedBy: exc.resolvedBy?.toString(),
      resolutionNote: exc.resolutionNote,
      resolvedAt: serializeDate(exc.resolvedAt),
      reconciliationJobId: exc.reconciliationJobId.toString(),
    })),
  })
}