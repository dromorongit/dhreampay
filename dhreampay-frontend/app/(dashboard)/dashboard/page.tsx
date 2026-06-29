import { auth } from '../../../lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { FileText, ArrowLeftRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { getDashboardSummary } from '../../../lib/api/reporting';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { RecentBatches } from '../../../components/dashboard/RecentBatches';
import { OpenExceptions } from '../../../components/dashboard/OpenExceptions';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  let summary;
  try {
    summary = await getDashboardSummary(session.user.accessToken);
  } catch {
    summary = {
      totalBatches: 0,
      totalTransactions: 0,
      overallMatchRate: 0,
      openExceptions: 0,
      highSeverityExceptions: 0,
      recentBatches: [],
    };
  }

  const matchRateAccent = summary.overallMatchRate >= 90 ? '#d4a017' : summary.overallMatchRate < 80 ? '#dc2626' : '#d4a017';

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Batches"
          value={summary.totalBatches}
          icon={<FileText size={24} />}
          accentColor="#1e3a5f"
        />
        <StatsCard
          title="Total Transactions"
          value={summary.totalTransactions}
          icon={<ArrowLeftRight size={24} />}
          accentColor="#1e3a5f"
        />
        <StatsCard
          title="Match Rate"
          value={`${summary.overallMatchRate}%`}
          icon={<CheckCircle size={24} />}
          accentColor={matchRateAccent}
        />
        <StatsCard
          title="Open Exceptions"
          value={summary.openExceptions}
          icon={<AlertTriangle size={24} />}
          accentColor={summary.openExceptions > 0 ? '#dc2626' : '#16a34a'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBatches batches={summary.recentBatches} />
        </div>
        <div>
          <OpenExceptions count={summary.openExceptions} highSeverityCount={summary.highSeverityExceptions} />
        </div>
      </div>
    </div>
  );
}