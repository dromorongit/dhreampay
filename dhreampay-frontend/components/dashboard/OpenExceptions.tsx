import Link from 'next/link';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface OpenExceptionsProps {
  count: number;
  highSeverityCount: number;
}

export function OpenExceptions({ count, highSeverityCount }: OpenExceptionsProps) {
  return (
    <div className="bg-[#f8fafc] rounded-xl p-6 border border-[#e2e8f0]">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={24} className="text-[#d4a017]" />
        <h3 className="text-lg font-semibold text-[#0f172a]">Open Exceptions</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-[#0f172a]">{count.toLocaleString()}</p>
          <p className="text-sm text-[#475569]">Total Open Exceptions</p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm text-red-600 font-medium">
              {highSeverityCount} High Severity
            </span>
          </div>
        )}

        {count === 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">All exceptions resolved</span>
          </div>
        )}

        <Link
          href="/dashboard/exceptions"
          className="inline-block text-sm text-[#1e3a5f] hover:underline"
        >
          View All Exceptions
        </Link>
      </div>
    </div>
  );
}