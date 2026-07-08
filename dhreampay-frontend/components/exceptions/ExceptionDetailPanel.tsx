'use client';

import { FC, useState, useEffect } from 'react';
import { updateException } from '@/lib/api/exceptions';
import type { Exception } from '../../types/api';
import { StatusTransitionButton } from './StatusTransitionButton';
import { Loader2, X } from 'lucide-react';
import type { UserRole } from '../../types/api';

interface ExceptionDetailPanelProps {
  exception: Exception | null;
  token: string;
  userRole: UserRole;
  onClose: () => void;
  onUpdated: (updated: Exception) => void;
}

const formatExceptionType = (type: Exception['exceptionType']): string => {
  const typeMap: Record<Exception['exceptionType'], string> = {
    amount_mismatch: 'Amount Mismatch',
    missing_bank_record: 'Missing Bank Record',
    missing_visa_record: 'Missing Visa Record',
    duplicate: 'Duplicate',
    date_mismatch: 'Date Mismatch',
    other: 'Other',
  };
  return typeMap[type] ?? type;
};

export const ExceptionDetailPanel: FC<ExceptionDetailPanelProps> = ({
  exception,
  token,
  userRole,
  onClose,
  onUpdated,
}) => {
  const [assignedTo, setAssignedTo] = useState(exception?.assignedTo ?? '');
  const [resolutionNotes, setResolutionNotes] = useState(exception?.resolutionNotes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAssignedTo(exception?.assignedTo ?? '');
    setResolutionNotes(exception?.resolutionNotes ?? '');
  }, [exception]);

  if (!exception) {
    return null;
  }

  const canEdit = userRole === 'admin' || userRole === 'reconciler';

  const handleAssignedToBlur = async () => {
    if (!canEdit) return;
    if (assignedTo === (exception.assignedTo ?? '')) return;

    setLoading(true);
    setAssignedError(null);

    try {
      const response = await updateException(token, exception._id, { assignedTo });
      if (response.data) {
        onUpdated(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment';
      setAssignedError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!canEdit) return;

    setSavingNotes(true);
    setNotesError(null);

    try {
      const response = await updateException(token, exception._id, { resolutionNotes });
      if (response.data) {
        onUpdated(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save notes';
      setNotesError(errorMessage);
    } finally {
      setSavingNotes(false);
    }
  };

  const showResolutionNotes = exception.status === 'investigating' || exception.status === 'resolved';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Exception Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Exception ID</label>
              <p className="text-sm font-mono text-slate-900 mt-1">{exception.exceptionId}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Type</label>
              <p className="text-sm text-slate-900 mt-1">{formatExceptionType(exception.exceptionType)}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Severity</label>
              <p className="text-sm text-slate-900 mt-1 capitalize">{exception.severity}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
              <p className="text-sm text-slate-900 mt-1 capitalize">{exception.status}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Description</label>
              <p className="text-sm text-slate-900 mt-1">{exception.description}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Assigned To</label>
              {canEdit ? (
<input
                   type="text"
                   value={assignedTo}
                   onChange={(e) => setAssignedTo(e.target.value)}
                   onBlur={handleAssignedToBlur}
                   disabled={loading}
                   placeholder="Enter assignee name"
                   className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white disabled:opacity-50"
                 />
              ) : (
                <p className="text-sm text-slate-900 mt-1">{exception.assignedTo ?? 'Unassigned'}</p>
              )}
              {assignedError && <span className="text-xs text-red-600 mt-1">{assignedError}</span>}
            </div>

            {showResolutionNotes && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Resolution Notes</label>
                {canEdit ? (
                  <>
<textarea
                       value={resolutionNotes}
                       onChange={(e) => setResolutionNotes(e.target.value)}
                       placeholder="Add resolution notes..."
                       rows={4}
                       className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white resize-none"
                     />
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e3a5f] text-white hover:bg-[#2d5a9e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingNotes && <Loader2 size={14} className="animate-spin" />}
                      Save Notes
                    </button>
                    {notesError && <span className="text-xs text-red-600 mt-1">{notesError}</span>}
                  </>
                ) : (
                  <p className="text-sm text-slate-900 mt-1 whitespace-pre-wrap">{exception.resolutionNotes ?? 'No notes added'}</p>
                )}
              </div>
            )}

            {canEdit && (
              <div className="pt-4 border-t border-[#e2e8f0]">
                <StatusTransitionButton
                  currentStatus={exception.status}
                  exceptionId={exception._id}
                  token={token}
                  onUpdated={onUpdated}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};