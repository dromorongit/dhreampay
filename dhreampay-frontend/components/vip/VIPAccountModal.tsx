'use client';

import { FC, useState } from 'react';
import { createVIPAccount, updateVIPAccount } from '@/lib/api/vipAccounts';
import type { VIPAccount, CreateVIPAccountDTO, UpdateVIPAccountDTO } from '../../types/api';
import { VIPAccountForm } from './VIPAccountForm';
import { Badge } from '../ui/Badge';

interface VIPAccountModalProps {
  mode: 'create' | 'edit' | 'view' | null;
  account: VIPAccount | null;
  token: string;
  onClose: () => void;
  onSaved: (account: VIPAccount) => void;
}

const tierVariantMap: Record<VIPAccount['vipTier'], 'gold' | 'warning' | 'default'> = {
  platinum: 'gold',
  gold: 'warning',
  silver: 'default',
};

export const VIPAccountModal: FC<VIPAccountModalProps> = ({
  mode,
  account,
  token,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mode) {
    return null;
  }

  const getTitle = (): string => {
    if (mode === 'create') return 'Add VIP Account';
    if (mode === 'edit') return 'Edit VIP Account';
    return 'VIP Account Details';
  };

  const handleFormSubmit = async (data: CreateVIPAccountDTO | UpdateVIPAccountDTO) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const response = await createVIPAccount(token, data as CreateVIPAccountDTO);
        if (response.data) {
          onSaved(response.data);
        }
      } else if (mode === 'edit' && account) {
        const response = await updateVIPAccount(token, account._id, data as UpdateVIPAccountDTO);
        if (response.data) {
          onSaved(response.data);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{getTitle()}</h2>

            {mode === 'view' && account && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Account ID</label>
                  <p className="text-sm font-mono text-slate-900 mt-1">{account.accountId}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Card Number</label>
                  <p className="text-sm text-slate-900 mt-1">{account.cardNumberMasked}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Customer Name</label>
                  <p className="text-sm text-slate-900 mt-1">{account.customerName}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">VIP Tier</label>
                  <div className="mt-1">
                    <Badge
                      label={account.vipTier.charAt(0).toUpperCase() + account.vipTier.slice(1)}
                      variant={tierVariantMap[account.vipTier]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Account Manager
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {account.accountManager ?? '—'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Notes</label>
                  <p className="text-sm text-slate-900 mt-1 whitespace-pre-wrap">
                    {account.notes ?? '—'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
                  <div className="mt-1">
                    <Badge
                      label={account.isActive ? 'Active' : 'Inactive'}
                      variant={account.isActive ? 'success' : 'default'}
                    />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'create' || mode === 'edit') && (
              <VIPAccountForm
                initialData={account}
                onSubmit={handleFormSubmit}
                onCancel={onClose}
                loading={loading}
                submitError={error}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};