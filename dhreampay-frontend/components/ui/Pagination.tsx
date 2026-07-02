'use client';

import { FC } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page <= 3) {
        pages.push(2, 3, 'ellipsis', totalPages - 1, totalPages);
      } else if (page >= totalPages - 2) {
        pages.push('ellipsis', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#1e3a5f] hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                item === page
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-white text-[#1e3a5f] hover:bg-slate-100 border border-[#e2e8f0]'
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#1e3a5f] hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};