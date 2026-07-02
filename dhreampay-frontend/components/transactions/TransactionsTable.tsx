import type { FC } from 'react';
import type { Transaction } from '../../types/api';
import { Badge } from '../ui/Badge';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const sourceVariantMap: Record<Transaction['source'], 'info' | 'gold'> = {
  bank: 'info',
  visa: 'gold',
};

const typeVariantMap: Record<Transaction['transactionType'], 'success' | 'warning' | 'error' | 'default'> = {
  purchase: 'success',
  refund: 'warning',
  reversal: 'error',
  adjustment: 'default',
};

const statusVariantMap: Record<Transaction['status'], 'default' | 'success' | 'error' | 'info'> = {
  unmatched: 'default',
  matched: 'success',
  exception: 'error',
  resolved: 'info',
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

function truncateId(id: string): string {
  return id.length > 15 ? `${id.slice(0, 15)}...` : id;
}

export const TransactionsTable: FC<TransactionsTableProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">No transactions found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e3a5f]">
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Transaction ID</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Source</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Type</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Card Number</th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">Amount</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Transaction Date</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Merchant ID</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">VIP</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction._id}
                className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td
                  className="py-3 px-4 text-sm text-[#0f172a] font-mono truncate max-w-[150px]"
                  title={transaction.transactionId}
                >
                  {truncateId(transaction.transactionId)}
                </td>
                <td className="py-3 px-4">
                  <Badge label={transaction.source.toUpperCase()} variant={sourceVariantMap[transaction.source]} />
                </td>
                <td className="py-3 px-4">
                  <Badge label={transaction.transactionType} variant={typeVariantMap[transaction.transactionType]} />
                </td>
                <td className="py-3 px-4 text-sm text-[#475569] font-mono">
                  {transaction.cardNumberMasked}
                </td>
                <td className="py-3 px-4 text-right text-sm text-[#0f172a]">
                  {formatAmount(transaction.amount)}
                </td>
                <td className="py-3 px-4 text-sm text-[#475569]">
                  {formatDate(transaction.transactionDate)}
                </td>
                <td className="py-3 px-4 text-sm text-[#475569]">
                  {transaction.merchantId}
                </td>
                <td className="py-3 px-4 text-center">
                  {transaction.isVIP && (
                    <svg className="w-5 h-5 text-amber-500 inline-block" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927a1 1 0 01.972.063l4.95 3.2a1 1 0 01.287.917v5.174a1 1 0 01-.287.917l-4.95 3.2a1 1 0 01-.972.063H4.95a1 1 0 01-.972-.063l-4.95-3.2a1 1 0 01-.287-.917V7.104a1 1 0 01.287-.917l4.95-3.2a1 1 0 01.972-.063z" />
                    </svg>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    label={transaction.status}
                    variant={statusVariantMap[transaction.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};