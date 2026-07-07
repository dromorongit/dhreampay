'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { getSettlementBatches } from '@/lib/api/settlements';
import { getReconciliationRecords } from '@/lib/api/reconciliation';
import { BatchSelector } from '@/components/reconciliation/BatchSelector';
import { ReconciliationTrigger } from '@/components/reconciliation/ReconciliationTrigger';
import { MatchingSummaryCard } from '@/components/reconciliation/MatchingSummaryCard';
import { ReconciliationResultsTable } from '@/components/reconciliation/ReconciliationResultsTable';
import type { MatchingSummary, ReconciliationRecord } from '@/types/api';
import type { SettlementBatch } from '@/types/settlementBatch';

export default function ReconciliationPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const userRole = session?.user?.role ?? 'viewer';
  const searchParams = useSearchParams();

  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [matchingSummary, setMatchingSummary] = useState<MatchingSummary | null>(null);
  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const refreshRecords = useCallback(async (batchId: string) => {
    if (!token) return;

    setLoadingRecords(true);
    try {
      const response = await getReconciliationRecords(token, {
        settlementBatchId: batchId,
        limit: 100,
      });
      setReconciliationRecords(response.data ?? []);
    } catch {
      setReconciliationRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [token]);

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

  useEffect(() => {
    const batchIdParam = searchParams?.get('batchId');
    if (batchIdParam && !selectedBatchId) {
      setSelectedBatchId(batchIdParam);
    }
  }, [searchParams, selectedBatchId]);

  useEffect(() => {
    if (!token || !selectedBatchId) {
      setReconciliationRecords([]);
      setMatchingSummary(null);
      setLoadingRecords(false);
      return;
    }

    void refreshRecords(selectedBatchId);
  }, [token, selectedBatchId, refreshRecords]);

  const handleTriggerComplete = (summary: MatchingSummary) => {
    setMatchingSummary(summary);
    if (selectedBatchId) {
      void refreshRecords(selectedBatchId);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-[#475569]">Loading batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Reconciliation</h1>
        <p className="text-[#475569] mt-1">
          Select a batch and run the matching engine to reconcile bank and Visa transactions
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0f172a]">Select Batch</h2>
        <BatchSelector
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelect={(batchId) => {
            setSelectedBatchId(batchId === '' ? null : batchId);
            setMatchingSummary(null);
          }}
          disabled={false}
        />
      </section>

      {selectedBatchId && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0f172a]">Run Matching Engine</h2>
          <ReconciliationTrigger
            selectedBatchId={selectedBatchId}
            token={token ?? ''}
            userRole={userRole}
            onComplete={handleTriggerComplete}
          />
        </section>
      )}

      {(matchingSummary ?? reconciliationRecords.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0f172a]">Results</h2>
          {matchingSummary && <MatchingSummaryCard summary={matchingSummary} />}
          {loadingRecords ? (
            <div className="flex items-center justify-center py-12">
              <span className="animate-spin text-xl mr-2">⟳</span>
              <p className="text-sm text-[#475569]">Loading records...</p>
            </div>
          ) : (
            <ReconciliationResultsTable records={reconciliationRecords} />
          )}
        </section>
      )}
    </div>
  );
}