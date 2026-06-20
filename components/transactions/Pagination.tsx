'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({ page, totalPages, limit, onPageChange, onLimitChange }: PaginationProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-dhreampay-border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-dhreampay-text-secondary">Rows per page:</span>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          className="px-2 py-1 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-dhreampay-text-secondary">
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            className="p-1.5 rounded-md border border-dhreampay-border text-dhreampay-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dhreampay-border transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            className="p-1.5 rounded-md border border-dhreampay-border text-dhreampay-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dhreampay-border transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}