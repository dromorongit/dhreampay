'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getSettlementBatches } from '@/lib/api/settlements';
import { getBatchSummary } from '@/lib/api/reporting';
import { BatchSummaryCard } from '@/components/reports/BatchSummaryCard';
import { ExportOptions } from '@/components/reports/ExportOptions';
import { ExceptionBreakdownChart } from '@/components/reports/ExceptionBreakdownChart';
import type { SettlementBatch } from '@/types/settlementBatch';
import type { BatchSummaryReport } from '@/types/settlementBatch';
import Link from 'next/link';

export default function ReportsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const userRole = session?.user?.role ?? 'viewer';

  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [summary, setSummary] = useState<BatchSummaryReport | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await getSettlementBatches(token, { status: 'completed', limit: 50 });
        setBatches(response.data ?? []);
      } catch {
        setBatches([]);
      } finally {
        setInitialLoading(false);
      }
    }

    void loadBatches();
  }, [token]);

  const fetchSummary = useCallback(async (batchId: string) => {
    if (!token) return;

    setLoadingSummary(true);
    setSummaryError(null);

    try {
      const data = await getBatchSummary(token, batchId);
      setSummary(data);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to load summary');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [token]);

  useEffect(() => {
    if (!selectedBatchId) {
      setSummary(null);
      return;
    }

    void fetchSummary(selectedBatchId);
  }, [selectedBatchId, fetchSummary]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-[#475569]">Loading batches...</p>
      </div>
    );
  }

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Reports & Export</h1>
        <p className="text-[#475569] mt-1">
          Generate and download reconciliation reports for completed batches
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0f172a]">Select Batch</h2>
        {batches.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] text-center">
            <p className="text-slate-600 mb-4">No completed batches available. Upload and reconcile a batch first.</p>
            <Link href="/batches/upload" className="text-[#1e3a5f] hover:underline">
              Go to Upload
            </Link>
          </div>
        ) : (
          <select
            value={selectedBatchId ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedBatchId(value === '' ? null : value);
            }}
            className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
          >
            <option value="">Select a completed batch...</option>
            {batches.map((batch) => {
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
        )}
      </section>

      {selectedBatchId && (
        <section className="space-y-6">
          {loadingSummary ? (
            <div className="flex items-center justify-center py-12">
              <span className="animate-spin text-xl mr-2">⟳</span>
              <p className="text-sm text-[#475569]">Loading summary...</p>
            </div>
          ) : summaryError !== null ? (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <p className="text-red-600 text-center">{summaryError}</p>
            </div>
          ) : summary !== null && selectedBatch !== null ? (
            <>
              <BatchSummaryCard summary={summary} />
              <ExceptionBreakdownChart breakdown={summary.exceptionBreakdown} />
            </>
          ) : null}
        </section>
      )}

      {selectedBatchId && (
        <section>
          <ExportOptions batchId={selectedBatchId} token={token ?? ''} userRole={userRole} />
        </section>
      )}
    </div>
  );
}