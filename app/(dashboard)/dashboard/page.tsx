import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { TransactionChart } from '@/components/dashboard/TransactionChart'
import { RecentJobs } from '@/components/dashboard/RecentJobs'
import { RecentExceptions } from '@/components/dashboard/RecentExceptions'
import { CreditCard, CheckCircle, AlertTriangle, Star } from 'lucide-react'

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
  const [summaryRes, chartRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/dashboard/summary`),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/dashboard/chart`),
  ])

  const summary = await summaryRes.json()
  const chartData = await chartRes.json()

  return {
    totalTransactions: summary.totalTransactions || 0,
    totalMatched: summary.totalMatched || 0,
    totalExceptions: summary.totalExceptions || 0,
    totalVIP: summary.totalVIP || 0,
    recentJobs: summary.recentJobs || [],
    recentExceptions: summary.recentExceptions || [],
    chartData: chartData || [],
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