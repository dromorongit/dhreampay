import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { TransactionChart } from '@/components/dashboard/TransactionChart'
import { RecentJobs } from '@/components/dashboard/RecentJobs'
import { RecentExceptions } from '@/components/dashboard/RecentExceptions'
import { CreditCard, CheckCircle, AlertTriangle, Star } from 'lucide-react'
import { connectDB } from '@/lib/mongodb/client'
import { Transaction, Exception, ReconciliationJob } from '@/models'

interface ReconciliationJob {
  _id: string
  jobName: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  totalTransactions: number
  totalMatched: number
  totalUnmatched: number
  totalVIP: number
  startedAt: string
  completedAt?: string
  triggeredBy: string
}

interface Exception {
  _id: string
  transactionId: string
  exceptionType: 'UNMATCHED' | 'DUPLICATE' | 'AMOUNT_MISMATCH' | 'DATE_MISMATCH' | 'MISSING_REFERENCE' | 'VIP_REVIEW'
  reason: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED'
  resolvedBy?: string
  resolutionNote?: string
  resolvedAt?: string
  reconciliationJobId: string
}

interface ChartData {
  date: string
  BANK: number
  VISA: number
}

interface DashboardSummary {
  totalTransactions: number
  totalMatched: number
  totalExceptions: number
  totalVIP: number
  recentJobs: ReconciliationJob[]
  recentExceptions: Exception[]
}

async function getDashboardData(): Promise<DashboardSummary & { chartData: ChartData[] }> {
  await connectDB()

  const [totalTransactions, totalMatched, totalExceptions, totalVIP, recentJobs, recentExceptions] = await Promise.all([
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: 'MATCHED' }),
    Exception.countDocuments({ status: 'OPEN' }),
    Transaction.countDocuments({ isVIP: true }),
    ReconciliationJob.find().sort({ startedAt: -1 }).limit(5).lean(),
    Exception.find({ status: 'OPEN' }).sort({ createdAt: -1 }).limit(5).populate('transactionId').lean(),
  ])

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const pipeline = [
    {
      $match: {
        transactionDate: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' },
          },
          source: '$source',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ] as any

  const results = await Transaction.aggregate(pipeline)
  const chartData = results.reduce((acc: any, item: any) => {
    const date = item._id.date
    if (!acc[date]) {
      acc[date] = { date, BANK: 0, VISA: 0 }
    }
    acc[date][item._id.source] = item.count
    return acc
  }, {})

const serializeDate = (date: Date | string | undefined | null): string | undefined =>
    date ? (date instanceof Date ? date.toISOString() : date) : undefined

  return {
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
      transactionId: typeof exc.transactionId === 'string' ? exc.transactionId : (exc.transactionId as any)?._id?.toString() || '',
      exceptionType: exc.exceptionType,
      reason: exc.reason || '',
      severity: exc.severity,
      status: exc.status,
      resolvedBy: exc.resolvedBy?.toString(),
      resolutionNote: exc.resolutionNote,
      resolvedAt: serializeDate(exc.resolvedAt),
      reconciliationJobId: exc.reconciliationJobId?.toString() || '',
    })),
    chartData: Object.values(chartData),
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const dashboardData = await getDashboardData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={dashboardData.totalTransactions}
            icon={CreditCard}
            color="blue"
          />
          <StatCard
            title="Matched"
            value={dashboardData.totalMatched}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Exceptions"
            value={dashboardData.totalExceptions}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="VIP Transactions"
            value={dashboardData.totalVIP}
            icon={Star}
            color="gold"
          />
        </div>

        <TransactionChart data={dashboardData.chartData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentJobs jobs={dashboardData.recentJobs} />
          <RecentExceptions exceptions={dashboardData.recentExceptions} />
        </div>
      </div>
    </DashboardLayout>
  )
}