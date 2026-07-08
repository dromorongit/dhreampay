'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TransactionFiltersProps {
  initialValues: {
    source: string;
    status: string;
    isVIP: boolean;
    dateFrom: string;
    dateTo: string;
  };
}

export const TransactionFilters: FC<TransactionFiltersProps> = ({ initialValues }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [source, setSource] = useState(initialValues.source);
  const [status, setStatus] = useState(initialValues.status);
  const [isVIP, setIsVIP] = useState(initialValues.isVIP);
  const [dateFrom, setDateFrom] = useState(initialValues.dateFrom);
  const [dateTo, setDateTo] = useState(initialValues.dateTo);

  useEffect(() => {
    setSource(initialValues.source);
    setStatus(initialValues.status);
    setIsVIP(initialValues.isVIP);
    setDateFrom(initialValues.dateFrom);
    setDateTo(initialValues.dateTo);
  }, [initialValues]);

  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    updateUrlParams({ source: value === 'all' ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateUrlParams({ status: value === 'all' ? undefined : value });
  };

  const handleVIPChange = (checked: boolean) => {
    setIsVIP(checked);
    updateUrlParams({ isVIP: checked ? 'true' : undefined });
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    updateUrlParams({ dateFrom: value || undefined });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    updateUrlParams({ dateTo: value || undefined });
  };

  const resetFilters = () => {
    setSource('all');
    setStatus('all');
    setIsVIP(false);
    setDateFrom('');
    setDateTo('');
    router.push('/transactions');
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="source-filter">
            Source
          </label>
<select
             id="source-filter"
             value={source}
             onChange={(e) => handleSourceChange(e.target.value)}
             className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
           >
            <option value="all">All</option>
            <option value="bank">Bank</option>
            <option value="visa">Visa</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="status-filter">
            Status
          </label>
<select
             id="status-filter"
             value={status}
             onChange={(e) => handleStatusChange(e.target.value)}
             className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
           >
            <option value="all">All</option>
            <option value="unmatched">Unmatched</option>
            <option value="matched">Matched</option>
            <option value="exception">Exception</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vip-filter"
            checked={isVIP}
            onChange={(e) => handleVIPChange(e.target.checked)}
            className="w-4 h-4 text-[#1e3a5f] border border-[#e2e8f0] rounded focus:ring-[#1e3a5f]"
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="vip-filter">
            Show VIP only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="date-from">
            Date From
          </label>
<input
             type="date"
             id="date-from"
             value={dateFrom}
             onChange={(e) => handleDateFromChange(e.target.value)}
             className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
           />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="date-to">
            Date To
          </label>
<input
             type="date"
             id="date-to"
             value={dateTo}
             onChange={(e) => handleDateToChange(e.target.value)}
             className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
           />
        </div>

        <button
          onClick={resetFilters}
          className="ml-auto px-4 py-2 text-sm text-[#1e3a5f] border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};