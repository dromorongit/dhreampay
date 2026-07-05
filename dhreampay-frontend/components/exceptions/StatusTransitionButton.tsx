'use client';

import { FC, useState } from 'react';
import { updateException } from '@/lib/api/exceptions';
import type { Exception } from '../../types/api';
import { Loader2 } from 'lucide-react';

interface StatusTransitionButtonProps {
  currentStatus: string;
  exceptionId: string;
  token: string;
  onUpdated: (updated: Exception) => void;
}

const allowedTransitions: Record<string, string[]> = {
  open: ['investigating'],
  investigating: ['resolved', 'escalated'],
  escalated: ['resolved'],
  resolved: [],
};

const statusLabels: Record<string, string> = {
  investigating: 'Mark Investigating',
  resolved: 'Mark Resolved',
  escalated: 'Escalate',
};

const statusButtonClasses: Record<string, string> = {
  investigating: 'bg-blue-600 text-white hover:bg-blue-700',
  resolved: 'bg-green-600 text-white hover:bg-green-700',
  escalated: 'bg-red-600 text-white hover:bg-red-700',
};

export const StatusTransitionButton: FC<StatusTransitionButtonProps> = ({
  currentStatus,
  exceptionId,
  token,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = allowedTransitions[currentStatus] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <span className="inline-flex px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
        Resolved
      </span>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateException(token, exceptionId, { status: newStatus });
      if (response.data) {
        onUpdated(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${statusButtonClasses[status] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {statusLabels[status] ?? status}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};