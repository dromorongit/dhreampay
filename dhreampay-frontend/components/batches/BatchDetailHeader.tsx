import Link from 'next/link';
import { Badge } from '../ui/Badge';
import type { SettlementBatch } from '../../types/settlementBatch';

interface BatchDetailHeaderProps {
  batch: SettlementBatch;
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const sourceVariantMap: Record<SettlementBatch['source'], 'info' | 'gold'> = {
  bank: 'info',
  visa: 'gold',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatAmount(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}

export function BatchDetailHeader({ batch }: BatchDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link href="/batches" className="text-sm text-[#1e3a5f] hover:underline">
        ← Back to Batches
      </Link>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Batch ID</label>
            <p className="text-sm font-mono text-slate-900 mt-1">{batch.batchId}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Source</label>
            <div className="mt-1">
              <Badge label={batch.source.toUpperCase()} variant={sourceVariantMap[batch.source]} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">File Name</label>
            <p className="text-sm text-slate-900 mt-1 truncate" title={batch.fileName}>
              {batch.fileName}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Batch Date</label>
            <p className="text-sm text-slate-900 mt-1">{formatDate(batch.batchDate)}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Total Amount</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">{formatAmount(batch.totalAmount)}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Total Count</label>
            <p className="text-sm text-slate-900 mt-1">{batch.totalCount}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusColors[batch.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {batch.status}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Uploaded By</label>
            <p className="text-sm text-slate-900 mt-1">{batch.uploadedBy}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Created At</label>
            <p className="text-sm text-slate-900 mt-1">{formatDate(batch.createdAt)}</p>
          </div>
        </div>

        {batch.status === 'completed' && (
          <div className="mt-6 pt-4 border-t border-[#e2e8f0]">
            <Link
              href={`/reconciliation?batchId=${batch._id}`}
              className="inline-block bg-[#d4a017] text-white px-4 py-2 rounded-lg hover:bg-[#b88a10] transition-colors text-sm font-medium"
            >
              Run Reconciliation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}