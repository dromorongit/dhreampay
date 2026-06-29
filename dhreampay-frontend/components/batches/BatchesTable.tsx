import type { SettlementBatch } from "../../types/settlementBatch";
import type { UserRole } from "../../types/api";
import Link from "next/link";

interface BatchesTableProps {
  batches: SettlementBatch[];
  userRole?: UserRole;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const sourceColors: Record<string, string> = {
  bank: "bg-blue-100 text-blue-800",
  visa: "bg-amber-100 text-amber-800",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatAmount(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}

export function BatchesTable({ batches, userRole }: BatchesTableProps) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">
          No settlement batches uploaded yet. Upload your first file to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e3a5f]">
              <th className="text-left text-xs font-medium text-white pb-3 px-4">
                Batch ID
              </th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">
                Date
              </th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">
                Source
              </th>
              <th className="text-left text-xs font-medium text-white pb-3 px-4">
                File Name
              </th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">
                Total Rows
              </th>
              <th className="text-right text-xs font-medium text-white pb-3 px-4">
                Total Amount
              </th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">
                Status
              </th>
              <th className="text-center text-xs font-medium text-white pb-3 px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr
                key={batch._id}
                className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f1f5f9] transition-colors"
              >
                <td
                  className="py-3 px-4 text-sm text-[#0f172a] font-mono truncate max-w-[120px]"
                  title={batch.batchId}
                >
                  {batch.batchId}
                </td>
                <td className="py-3 px-4 text-sm text-[#475569]">
                  {formatDate(batch.batchDate)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${sourceColors[batch.source] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {batch.source.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-[#475569] truncate max-w-[150px]">
                  {batch.fileName}
                </td>
                <td className="py-3 px-4 text-right text-sm text-[#0f172a]">
                  {batch.totalCount}
                </td>
                <td className="py-3 px-4 text-right text-sm text-[#0f172a]">
                  {formatAmount(batch.totalAmount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusColors[batch.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {batch.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
<Link
                       href={`/batches/${batch._id}`}
                       className="text-xs text-[#1e3a5f] hover:underline"
                     >
                       View
                     </Link>
                     {userRole !== 'viewer' && batch.status === 'completed' && (
                       <Link
                         href={`/reconciliation?batchId=${batch._id}`}
                         className="text-xs text-[#1e3a5f] hover:underline"
                       >
                         Reconcile
                       </Link>
                     )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}