'use client';

import type { FC } from 'react';
import type { VIPAccount } from '../../types/api';
import { Badge } from '../ui/Badge';

interface VIPAccountsTableProps {
  accounts: VIPAccount[];
  userRole: string;
  onView: (account: VIPAccount) => void;
  onEdit: (account: VIPAccount) => void;
  onDelete: (account: VIPAccount) => void;
}

const tierVariantMap: Record<VIPAccount['vipTier'], 'gold' | 'warning' | 'default'> = {
  platinum: 'gold',
  gold: 'warning',
  silver: 'default',
};

export const VIPAccountsTable: FC<VIPAccountsTableProps> = ({
  accounts,
  userRole,
  onView,
  onEdit,
  onDelete,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">No VIP accounts found. Try adjusting your filters.</p>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
<div className="overflow-x-auto">
         <table className="w-full min-w-[768px]">
          <thead>
            <tr className="bg-[#1e3a5f]">
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Account ID</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Customer Name</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Card Number</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">VIP Tier</th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">Account Manager</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Status</th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr
                key={account._id}
                className={`border-b border-[#e2e8f0] last:border-0 transition-colors ${
                  !account.isActive ? 'text-[#94a3b8]' : 'hover:bg-slate-50'
                }`}
              >
                <td
                  className="py-3 px-4 text-sm font-mono truncate max-w-[120px]"
                  title={account.accountId}
                >
                  {account.accountId}
                </td>
                <td className="py-3 px-4 text-sm truncate max-w-[150px]" title={account.customerName}>
                  {account.customerName}
                </td>
                <td className="py-3 px-4 text-sm" title={account.cardNumberMasked}>
                  {account.cardNumberMasked}
                </td>
                <td className="py-3 px-4">
                  <Badge
                    label={account.vipTier.charAt(0).toUpperCase() + account.vipTier.slice(1)}
                    variant={tierVariantMap[account.vipTier]}
                  />
                </td>
                <td className="py-3 px-4 text-sm" title={account.accountManager ?? ''}>
                  {account.accountManager ?? '—'}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    label={account.isActive ? 'Active' : 'Inactive'}
                    variant={account.isActive ? 'success' : 'default'}
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(account)}
                      className="text-xs text-[#1e3a5f] hover:underline"
                    >
                      View
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(account)}
                          className="text-xs text-[#1e3a5f] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(account)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};