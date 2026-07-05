'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ExceptionFiltersProps {
  initialValues: {
    status: string;
    severity: string;
    exceptionType: string;
  };
}

const severityOptions = [
  { value: 'all', label: 'All Severities', badgeClass: 'bg-gray-100 text-gray-600' },
  { value: 'high', label: 'High', badgeClass: 'bg-red-100 text-red-700' },
  { value: 'medium', label: 'Medium', badgeClass: 'bg-amber-100 text-amber-700' },
  { value: 'low', label: 'Low', badgeClass: 'bg-blue-100 text-blue-700' },
];

export const ExceptionFilters: FC<ExceptionFiltersProps> = ({ initialValues }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(initialValues.status);
  const [severity, setSeverity] = useState(initialValues.severity);
  const [exceptionType, setExceptionType] = useState(initialValues.exceptionType);

  useEffect(() => {
    setStatus(initialValues.status);
    setSeverity(initialValues.severity);
    setExceptionType(initialValues.exceptionType);
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

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateUrlParams({ status: value === 'all' ? undefined : value });
  };

  const handleSeverityChange = (value: string) => {
    setSeverity(value);
    updateUrlParams({ severity: value === 'all' ? undefined : value });
  };

  const handleTypeChange = (value: string) => {
    setExceptionType(value);
    updateUrlParams({ exceptionType: value === 'all' ? undefined : value });
  };

  const resetFilters = () => {
    setStatus('all');
    setSeverity('all');
    setExceptionType('all');
    router.push('/exceptions');
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="severity-filter">
            Severity
          </label>
          <select
            id="severity-filter"
            value={severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="type-filter">
            Type
          </label>
          <select
            id="type-filter"
            value={exceptionType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
          >
            <option value="all">All</option>
            <option value="amount_mismatch">Amount Mismatch</option>
            <option value="missing_bank_record">Missing Bank Record</option>
            <option value="missing_visa_record">Missing Visa Record</option>
            <option value="duplicate">Duplicate</option>
            <option value="date_mismatch">Date Mismatch</option>
            <option value="other">Other</option>
          </select>
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