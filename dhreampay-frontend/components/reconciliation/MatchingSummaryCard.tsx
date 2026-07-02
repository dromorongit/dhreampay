import { CheckCircle, AlertCircle, GitMerge, XCircle } from 'lucide-react';
import type { MatchingSummary } from '@/types/api';

interface MatchingSummaryCardProps {
  summary: MatchingSummary;
}

export function MatchingSummaryCard({ summary }: MatchingSummaryCardProps) {
  const matchRate = summary.totalProcessed > 0
    ? (summary.matched / summary.totalProcessed) * 100
    : 0;

  const barColor = matchRate >= 90 ? 'bg-green-500' : matchRate >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <p className="text-xs font-medium text-[#475569] mb-1">Total Processed</p>
          <p className="text-2xl font-bold text-sky-600">{summary.totalProcessed.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-xs font-medium text-[#475569]">Matched</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.matched.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-amber-600" />
            <p className="text-xs font-medium text-[#475569]">Unmatched</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.unmatched.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-1">
            <GitMerge size={16} className="text-sky-600" />
            <p className="text-xs font-medium text-[#475569]">Partial</p>
          </div>
          <p className="text-2xl font-bold text-sky-600">{summary.partial.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-600" />
            <p className="text-xs font-medium text-[#475569]">Exceptions</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.exceptions.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#0f172a]">Match Rate</p>
          <p className="text-sm font-bold text-[#0f172a]">{matchRate.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-[#e2e8f0] rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full ${barColor} transition-all`}
            style={{ width: `${matchRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
