'use client';

import { useState } from 'react';
import { triggerReconciliation } from '@/lib/api/reconciliation';
import type { MatchingSummary } from '@/types/api';

interface ReconciliationTriggerProps {
  selectedBatchId: string | null;
  token: string;
  userRole: string;
  onComplete: (summary: MatchingSummary) => void;
}

export function ReconciliationTrigger({ selectedBatchId, token, userRole, onComplete }: ReconciliationTriggerProps) {
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userRole === 'viewer') {
    return null;
  }

  const handleConfirm = async () => {
    if (!selectedBatchId) return;

    setConfirming(false);
    setRunning(true);
    setError(null);

    try {
      const response = await triggerReconciliation(token, selectedBatchId);
      if (response.data) {
        onComplete(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reconciliation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
      )}

      {!confirming && !running && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!selectedBatchId}
          className="px-6 py-3 rounded-lg font-medium transition-colors bg-[#d4a017] text-white hover:bg-[#b88a12] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Reconciliation
        </button>
      )}

      {confirming && (
        <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-sm">
          <p className="text-sm text-[#475569] mb-4">
            Are you sure you want to run reconciliation for batch <span className="font-mono font-medium text-[#0f172a]">{selectedBatchId}</span>? This will match bank and Visa transactions and raise exceptions for discrepancies.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#475569] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedBatchId}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#d4a017] hover:bg-[#b88a12] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {running && (
        <div className="flex items-center gap-3 text-sm text-[#475569]">
          <span className="animate-spin text-xl">⟳</span>
          Running reconciliation engine...
        </div>
      )}
    </div>
  );
}
