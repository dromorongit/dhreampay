'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination } from '../ui/Pagination';

interface PaginationWrapperProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export const PaginationWrapper: FC<PaginationWrapperProps> = ({ page, totalPages, searchParams }) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />;
};