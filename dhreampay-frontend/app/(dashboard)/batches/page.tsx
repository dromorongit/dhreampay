import { auth } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { getSettlementBatches } from '@/lib/api/settlements';
import { BatchesTable } from '@/components/batches/BatchesTable';
import Link from 'next/link';
import { Upload } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Settlement Batches</h1>
        {session.user.role !== 'viewer' && (
<Link
             href="/batches/upload"
             className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a9e] transition-colors"
           >
             Upload New File
           </Link>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Upload size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-600 mb-4">No batches uploaded yet</p>
          <Link href="/batches/upload" className="text-[#1e3a5f] hover:underline">
            Upload your first file
          </Link>
        </div>
      ) : (
        <BatchesTable batches={batches} userRole={session.user.role} />
      )}
    </div>
  );
}