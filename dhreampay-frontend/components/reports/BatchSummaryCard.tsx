import { CheckCircle, AlertCircle, GitMerge, XCircle } from 'lucide-react';
import type { BatchSummaryReport } from '@/types/settlementBatch';

interface BatchSummaryCardProps {
  summary: BatchSummaryReport;
}

export function BatchSummaryCard({ summary }: BatchSummaryCardProps) {
  const matchRate = summary.totalTransactions > 0
    ? (summary.matched / summary.totalTransactions) * 100
    : 0;

  const matchRateColor = matchRate >= 90 ? 'text-green-600' : matchRate >= 70 ? 'text-amber-600' : 'text-red-600';

  const date = new Date(summary.batch.batchDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Batch Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">Batch ID</p>
            <p className="text-sm text-[#0f172a] font-mono">{summary.batch.batchId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">Source</p>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-[#1e3a5f] text-white capitalize">
              {summary.batch.source}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">File Name</p>
            <p className="text-sm text-[#0f172a]">{summary.batch.fileName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">Batch Date</p>
            <p className="text-sm text-[#0f172a]">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">Uploaded By</p>
            <p className="text-sm text-[#0f172a]">{summary.batch.uploadedBy}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1">Status</p>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 capitalize">
              {summary.batch.status}
            </span>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-medium text-[#475569] mb-1">Generated At</p>
            <p className="text-sm text-[#0f172a]">
              {new Date(summary.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Reconciliation Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-xs font-medium text-[#475569] mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-[#0f172a]">{summary.totalTransactions.toLocaleString()}</p>
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
              <GitMerge size={16} className="text-blue-600" />
              <p className="text-xs font-medium text-[#475569]">Partial</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.partial.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-600" />
              <p className="text-xs font-medium text-[#475569]">Exceptions</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.exceptions.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-xs font-medium text-[#475569] mb-1">Match Rate %</p>
            <p className={`text-2xl font-bold ${matchRateColor}`}>{matchRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[#f0fdf4] border border-green-200">
          <p className="text-xs font-medium text-green-700 mb-1">Total Matched Amount</p>
          <p className="text-xl font-bold text-green-600">
            GHS {summary.totalMatchedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[#fef2f2] border border-red-200">
          <p className="text-xs font-medium text-red-700 mb-1">Total Unmatched Amount</p>
          <p className="text-xl font-bold text-red-600">
            GHS {summary.totalUnmatchedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}