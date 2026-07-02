import { auth } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/lib/api/transactions';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { PaginationWrapper } from '@/components/transactions/PaginationWrapper';
import type { Transaction } from '@/types/api';

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    source?: string;
    status?: string;
    isVIP?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const limit = 20;

  let transactions: Transaction[] = [];
  let pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

  try {
    const response = await getTransactions(session.user.accessToken, {
      page,
      limit,
      source: params.source,
      status: params.status,
      isVIP: params.isVIP === 'true',
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    });
    transactions = response.data ?? [];
    pagination = response.pagination;
  } catch {
    transactions = [];
  }

  const initialFilterValues = {
    source: params.source ?? 'all',
    status: params.status ?? 'all',
    isVIP: params.isVIP === 'true',
    dateFrom: params.dateFrom ?? '',
    dateTo: params.dateTo ?? '',
  };

  const currentSearchParams = {
    page: params.page,
    source: params.source,
    status: params.status,
    isVIP: params.isVIP,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-600 mt-1">
          {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} found
        </p>
      </div>

      <TransactionFilters initialValues={initialFilterValues} />

      <TransactionsTable transactions={transactions} />

      <PaginationWrapper
        page={pagination.page}
        totalPages={pagination.totalPages}
        searchParams={currentSearchParams}
      />
    </div>
  );
}