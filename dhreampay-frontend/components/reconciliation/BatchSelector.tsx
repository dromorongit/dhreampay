'use client';

import type { SettlementBatch } from '@/types/settlementBatch';
import Link from 'next/link';

interface BatchSelectorProps {
  batches: SettlementBatch[];
  selectedBatchId: string | null;
  onSelect: (batchId: string) => void;
  disabled: boolean;
}

export function BatchSelector({ batches, selectedBatchId, onSelect, disabled }: BatchSelectorProps) {
  const completedBatches = batches.filter((batch) => batch.status === 'completed');

  if (completedBatches.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">
          No completed batches available. Upload and process a file first.
        </p>
        <div className="text-center">
          <Link
            href="/batches/upload"
            className="text-sm text-[#1e3a5f] hover:underline"
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <select
      value={selectedBatchId ?? ''}
      onChange={(e) => {
        const value = e.target.value;
        onSelect(value === '' ? '' : value);
      }}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">Select a batch</option>
      {completedBatches.map((batch) => {
        const date = new Date(batch.batchDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        return (
          <option key={batch._id} value={batch._id}>
            {batch.batchId} — {batch.source.toUpperCase()} — {formattedDate} — {batch.totalCount} transactions
          </option>
        );
      })}
    </select>
  );
}
