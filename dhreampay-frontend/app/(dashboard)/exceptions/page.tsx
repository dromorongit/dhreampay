'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getExceptions } from '@/lib/api/exceptions';
import { ExceptionsTable } from '@/components/exceptions/ExceptionsTable';
import { ExceptionFilters } from '@/components/exceptions/ExceptionFilters';
import { ExceptionDetailPanel } from '@/components/exceptions/ExceptionDetailPanel';
import { PaginationWrapper } from '@/components/transactions/PaginationWrapper';
import type { Exception } from '@/types/api';
import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ExceptionsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const userRole = session?.user?.role ?? 'viewer';
  const searchParams = useSearchParams();

  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEx, setSelectedEx] = useState<Exception | null>(null);
  const [page, setPageState] = useState(1);

  const statusParam = searchParams.get('status') ?? 'all';
  const severityParam = searchParams.get('severity') ?? 'all';
  const exceptionTypeParam = searchParams.get('exceptionType') ?? 'all';
  const pageParam = searchParams.get('page') ?? '1';

  const fetchData = useCallback(async (token: string, pageNum: number, status: string, severity: string, type: string) => {
    setLoading(true);
    try {
      const response = await getExceptions(token, {
        page: pageNum,
        limit: 20,
        status: status === 'all' ? undefined : status,
        severity: severity === 'all' ? undefined : severity,
        exceptionType: type === 'all' ? undefined : type,
      });
      setExceptions(response.data ?? []);
      setTotal(response.pagination.total);

      const openExceptions = (response.data ?? []).filter((e) => e.status === 'open').length;
      setOpenCount(openExceptions);
    } catch {
      setExceptions([]);
      setTotal(0);
      setOpenCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const currentPage = parseInt(pageParam, 10) || 1;
    setPageState(currentPage);
    void fetchData(token, currentPage, statusParam, severityParam, exceptionTypeParam);
  }, [token, pageParam, statusParam, severityParam, exceptionTypeParam, fetchData]);

  const initialFilterValues = {
    status: statusParam,
    severity: severityParam,
    exceptionType: exceptionTypeParam,
  };

  const currentSearchParams = {
    page: pageParam,
    status: statusParam,
    severity: severityParam,
    exceptionType: exceptionTypeParam,
  };

  const hasActiveFilters = statusParam !== 'all' || severityParam !== 'all' || exceptionTypeParam !== 'all';

  const handleExceptionUpdated = (updated: Exception) => {
    setExceptions((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
    setSelectedEx(updated);
  };

  const handleClosePanel = () => {
    setSelectedEx(null);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exceptions</h1>
        <p className="text-slate-600 mt-1">
          {total} {total === 1 ? 'exception' : 'exceptions'} found
          {openCount > 0 && <span className="text-red-600 font-medium"> — {openCount} open</span>}
        </p>
      </div>

      <ExceptionFilters initialValues={initialFilterValues} />

      {exceptions.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <p className="text-slate-600 mb-4">No exceptions found</p>
          {hasActiveFilters && (
            <button
              onClick={() => {}}
              className="text-[#1e3a5f] hover:underline"
            >
              Try clearing filters
            </button>
          )}
        </div>
      ) : (
        <ExceptionsTable
          exceptions={exceptions}
          selectedId={selectedEx?._id ?? null}
          onSelect={setSelectedEx}
        />
      )}

      <PaginationWrapper
        page={page}
        totalPages={Math.ceil(total / 20)}
        searchParams={currentSearchParams}
      />

      {selectedEx && (
        <ExceptionDetailPanel
          exception={selectedEx}
          token={token ?? ''}
          userRole={userRole}
          onClose={handleClosePanel}
          onUpdated={handleExceptionUpdated}
        />
      )}
    </div>
  );
}