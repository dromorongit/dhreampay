import type { FC } from 'react';
import type { ReconciliationRecord } from '@/types/api';
import { Badge } from '../ui/Badge';

interface ReconciliationResultsTableProps {
  records: ReconciliationRecord[];
}

const statusVariantMap: Record<ReconciliationRecord['matchStatus'], 'success' | 'default' | 'warning' | 'error'> = {
  matched: 'success',
  unmatched: 'default',
  partial: 'warning',
  exception: 'error',
};

const typeVariantMap: Record<NonNullable<ReconciliationRecord['matchType']>, 'info' | 'gold' | 'default'> = {
  exact: 'info',
  fuzzy: 'gold',
  manual: 'default',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatAmount(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return 'N/A';
  return `GHS ${amount.toFixed(2)}`;
}

function truncateId(id: string): string {
  return id.length > 15 ? `${id.slice(0, 15)}...` : id;
}

export const ReconciliationResultsTable: FC<ReconciliationResultsTableProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">
          No reconciliation records found for this batch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e3a5f]">
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Record ID</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Bank Transaction ID</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Visa Transaction ID</th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">Bank Amount</th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">Visa Amount</th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">Amount Diff</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Match Status</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Match Type</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const bankTxId = record.bankTransactionId?.transactionId ?? 'N/A';
              const visaTxId = record.visaTransactionId?.transactionId ?? 'N/A';
              const bankAmount = record.bankTransactionId?.amount ?? null;
              const visaAmount = record.visaTransactionId?.amount ?? null;
              const amountDiff = record.amountDifference;

              let diffDisplay: string;
              let diffColorClass: string;
              if (amountDiff === undefined || amountDiff === null) {
                diffDisplay = 'N/A';
                diffColorClass = 'text-[#475569]';
              } else if (amountDiff > 0) {
                diffDisplay = `GHS ${amountDiff.toFixed(2)}`;
                diffColorClass = 'text-red-600';
              } else {
                diffDisplay = `GHS ${amountDiff.toFixed(2)}`;
                diffColorClass = 'text-green-600';
              }

              return (
                <tr
                  key={record._id}
                  className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td
                    className="py-3 px-4 text-sm text-[#0f172a] font-mono truncate max-w-[150px]"
                    title={record.recordId}
                  >
                    {truncateId(record.recordId)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569] font-mono">
                    {bankTxId}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569] font-mono">
                    {visaTxId}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[#0f172a]">
                    {formatAmount(bankAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[#0f172a]">
                    {formatAmount(visaAmount)}
                  </td>
                  <td className={`py-3 px-3 text-right text-sm font-medium ${diffColorClass}`}>
                    {diffDisplay}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge label={record.matchStatus} variant={statusVariantMap[record.matchStatus]} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {record.matchStatus !== 'unmatched' && record.matchType ? (
                      <Badge label={record.matchType} variant={typeVariantMap[record.matchType]} />
                    ) : (
                      <span className="text-xs text-[#475569]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569]">
                    {formatDate(record.createdAt)}
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
