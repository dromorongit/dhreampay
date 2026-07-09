'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getVIPAccounts, deleteVIPAccount } from '@/lib/api/vipAccounts';
import type { VIPAccount } from '@/types/api';
import { VIPAccountsTable } from '@/components/vip/VIPAccountsTable';
import { VIPAccountModal } from '@/components/vip/VIPAccountModal';
import { PaginationWrapper } from '@/components/transactions/PaginationWrapper';
import { Search, Plus, FileText } from 'lucide-react';

export default function VIPAccountsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const userRole = session?.user?.role ?? 'viewer';

  const [accounts, setAccounts] = useState<VIPAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<VIPAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getVIPAccounts(token, {
        page,
        limit: 20,
        search: searchTerm || undefined,
        vipTier: tierFilter || undefined,
        isActive: showInactive ? undefined : true,
      });
      setAccounts(response.data ?? []);
      setTotal(response.pagination.total);
    } catch {
      setAccounts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, tierFilter, showInactive]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleView = (account: VIPAccount) => {
    setSelectedAccount(account);
    setModalMode('view');
  };

  const handleEdit = (account: VIPAccount) => {
    setSelectedAccount(account);
    setModalMode('edit');
  };

  const handleDelete = (account: VIPAccount) => {
    setSelectedAccount(account);
    setDeleteConfirmId(account._id);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteConfirmId) return;

    const accountToDelete = accounts.find((a) => a._id === deleteConfirmId);
    if (!accountToDelete) return;

    try {
      await deleteVIPAccount(token, deleteConfirmId);
      setAccounts((prev) => prev.filter((a) => a._id !== deleteConfirmId));
      setTotal((prev) => prev - 1);
    } catch {
      // Error handled silently per requirements
    } finally {
      setDeleteConfirmId(null);
      setSelectedAccount(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
    setSelectedAccount(null);
  };

  const handleSaved = (account: VIPAccount) => {
    if (modalMode === 'create') {
      setAccounts((prev) => [account, ...prev]);
      setTotal((prev) => prev + 1);
    } else if (modalMode === 'edit') {
      setAccounts((prev) => prev.map((a) => (a._id === account._id ? account : a)));
    }
    setModalMode(null);
    setSelectedAccount(null);
  };

  const isAdmin = userRole === 'admin';
  const isFiltered = searchTerm !== '' || tierFilter !== '' || showInactive;

  const currentSearchParams = {
    page: String(page),
    search: searchTerm,
    vipTier: tierFilter,
    isActive: showInactive ? 'false' : 'true',
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">VIP Accounts</h1>
          <p className="text-slate-600 mt-1">
            {total} {total === 1 ? 'account' : 'accounts'} total
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModalMode('create')}
            className="bg-[#d4a017] text-white px-4 py-2 rounded-lg hover:bg-[#b88a15] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add VIP Account
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="tier-filter">
              Tier
            </label>
<select
               id="tier-filter"
               value={tierFilter}
               onChange={(e) => {
                 setTierFilter(e.target.value);
                 setPage(1);
               }}
               className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white text-slate-900"
             >
               <option value="" className="text-slate-900">All</option>
               <option value="platinum" className="text-slate-900">Platinum</option>
               <option value="gold" className="text-slate-900">Gold</option>
               <option value="silver" className="text-slate-900">Silver</option>
             </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="show-inactive"
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-[#1e3a5f] border-[#e2e8f0] rounded focus:ring-2 focus:ring-[#1e3a5f]"
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="show-inactive">
              Show Inactive
            </label>
          </div>

          {isFiltered && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTierFilter('');
                setShowInactive(false);
                setPage(1);
              }}
              className="ml-auto px-4 py-2 text-sm text-[#1e3a5f] border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {accounts.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-600 mb-4">No VIP accounts found</p>
          {isFiltered && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTierFilter('');
                setShowInactive(false);
                setPage(1);
              }}
              className="text-[#1e3a5f] hover:underline"
            >
              Try clearing filters
            </button>
          )}
        </div>
      ) : (
        <VIPAccountsTable
          accounts={accounts}
          userRole={userRole}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <PaginationWrapper
        page={page}
        totalPages={Math.ceil(total / 20)}
        searchParams={currentSearchParams}
      />

      <VIPAccountModal
        mode={modalMode}
        account={selectedAccount}
        token={token ?? ''}
        onClose={() => {
          setModalMode(null);
          setSelectedAccount(null);
        }}
        onSaved={handleSaved}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete VIP Account</h3>
            <p className="text-slate-600 mb-4">
              Delete this VIP account? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-[#1e3a5f] text-[#1e3a5f] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}