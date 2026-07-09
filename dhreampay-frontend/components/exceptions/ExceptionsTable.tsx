'use client';

import type { FC } from 'react';
import type { Exception } from '../../types/api';
import { Badge } from '../ui/Badge';

interface ExceptionsTableProps {
  exceptions: Exception[];
  selectedId: string | null;
  onSelect: (exception: Exception) => void;
}

const typeVariantMap: Record<Exception['exceptionType'], string> = {
  amount_mismatch: 'Amount Mismatch',
  missing_bank_record: 'Missing Bank Record',
  missing_visa_record: 'Missing Visa Record',
  duplicate: 'Duplicate',
  date_mismatch: 'Date Mismatch',
  other: 'Other',
};

const severityVariantMap: Record<Exception['severity'], 'error' | 'warning' | 'info'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const statusVariantMap: Record<Exception['status'], 'default' | 'success' | 'error' | 'info'> = {
  open: 'default',
  investigating: 'info',
  resolved: 'success',
  escalated: 'error',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function truncateId(id: string): string {
  return id.length > 15 ? `${id.slice(0, 15)}...` : id;
}

export const ExceptionsTable: FC<ExceptionsTableProps> = ({ exceptions, selectedId, onSelect }) => {
  if (exceptions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">No exceptions found. Try clearing filters.</p>
      </div>
    );
  }

  return (
<div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden w-full max-w-full">
<div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[768px]">
          <thead>
            <tr className="bg-[#1e3a5f]">
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Exception ID</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Type</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Severity</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Status</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Description</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Assigned To</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Created</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((exception) => {
              const isSelected = selectedId === exception._id;
              return (
                <tr
                  key={exception._id}
                  className={`border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${
                    isSelected ? 'border-l-4 border-[#d4a017] bg-amber-50' : ''
                  }`}
                  onClick={() => onSelect(exception)}
                >
                  <td
                    className="py-3 px-4 text-sm text-[#0f172a] font-mono truncate max-w-[120px]"
                    title={exception.exceptionId}
                  >
                    {truncateId(exception.exceptionId)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569]">
                    {typeVariantMap[exception.exceptionType] ?? exception.exceptionType}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge label={exception.severity} variant={severityVariantMap[exception.severity]} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge label={exception.status} variant={statusVariantMap[exception.status]} />
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569] truncate max-w-[200px]" title={exception.description}>
                    {truncateText(exception.description, 50)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569]">
                    {exception.assignedTo ?? 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569]">
                    {formatDate(exception.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(exception);
                      }}
                      className="text-xs text-[#1e3a5f] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};