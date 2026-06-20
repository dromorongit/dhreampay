'use client'

import { Search } from 'lucide-react'
import { Role } from '../../constants'

interface TransactionFiltersProps {
  search: string
  source: string
  status: string
  isVIP: string
  dateFrom: string
  dateTo: string
  onSearchChange: (value: string) => void
  onSourceChange: (value: string) => void
  onStatusChange: (value: string) => void
  onVIPChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  userRole?: Role
}

export function TransactionFilters({
  search,
  source,
  status,
  isVIP,
  dateFrom,
  dateTo,
  onSearchChange,
  onSourceChange,
  onStatusChange,
  onVIPChange,
  onDateFromChange,
  onDateToChange,
  userRole,
}: TransactionFiltersProps) {
  const showVIPFilter = userRole !== 'VIP_DESK'

  return (
    <div className="flex flex-col gap-4 p-4 border border-dhreampay-border rounded-lg bg-dhreampay-primary">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dhreampay-text-secondary" />
          <input
            type="text"
            placeholder="Search by transaction ref or card holder..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary placeholder-dhreampay-text-secondary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
          />
        </div>

        <select
          value={source}
          onChange={e => onSourceChange(e.target.value)}
          className="px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
        >
          <option value="">All Sources</option>
          <option value="BANK">Bank</option>
          <option value="VISA">Visa</option>
        </select>

        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="MATCHED">Matched</option>
          <option value="UNMATCHED">Unmatched</option>
          <option value="EXCEPTION">Exception</option>
          <option value="SETTLED">Settled</option>
        </select>

        {showVIPFilter && (
          <select
            value={isVIP}
            onChange={e => onVIPChange(e.target.value)}
            className="px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
          >
            <option value="">All Types</option>
            <option value="false">Regular Only</option>
            <option value="true">VIP Only</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-dhreampay-text-secondary">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            className="px-3 py-1.5 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-dhreampay-text-secondary">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            className="px-3 py-1.5 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
          />
        </div>
      </div>
    </div>
  )
}