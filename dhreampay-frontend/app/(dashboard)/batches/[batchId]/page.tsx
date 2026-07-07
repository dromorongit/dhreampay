import { auth } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { getSettlementBatchById } from '@/lib/api/settlements';
import { getTransactions } from '@/lib/api/transactions';
import { BatchDetailHeader } from '@/components/batches/BatchDetailHeader';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import type { Transaction } from '@/types/api';
import Link from 'next/link';

interface BatchDetailPageProps {
  params: {
    batchId: string;
  };
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const batchResponse = await getSettlementBatchById(session.user.accessToken, params.batchId);

  if (!batchResponse.success || !batchResponse.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batch not found</h1>
          <p className="text-[#475569] mt-1">
            The batch you are looking for does not exist or has been removed.
          </p>
        </div>
        <Link href="/batches" className="text-sm text-[#1e3a5f] hover:underline">
          ← Back to Batches
        </Link>
      </div>
    );
  }

  const batch = batchResponse.data;

  let transactions: Transaction[] = [];
  try {
    const txResponse = await getTransactions(session.user.accessToken, {
      settlementBatchId: params.batchId,
      limit: 100,
    });
    transactions = txResponse.data ?? [];
  } catch {
    transactions = [];
  }

  return (
    <div className="space-y-6">
      <BatchDetailHeader batch={batch} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0f172a]">Transactions</h2>
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}