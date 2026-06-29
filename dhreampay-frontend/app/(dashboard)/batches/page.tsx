import { auth } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { getSettlementBatches } from '@/lib/api/settlements';
import { BatchesTable } from '@/components/batches/BatchesTable';
import Link from 'next/link';
import type { SettlementBatch } from '@/types/settlementBatch';

export default async function BatchesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  let batches: SettlementBatch[] = [];
  try {
    const response = await getSettlementBatches(session.user.accessToken, { limit: 20 });
    batches = response.data ?? [];
  } catch {
    batches = [];
  }

  const canUpload = session.user.role !== 'viewer';

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Settlement Batches</h1>
          <p className="text-[#475569]">View and manage uploaded settlement files</p>
        </div>
        {canUpload && (
          <Link
            href="/dashboard/batches/upload"
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5a9e] transition-colors"
          >
            Upload New File
          </Link>
        )}
      </div>

      <BatchesTable batches={batches} />
    </div>
  );
}