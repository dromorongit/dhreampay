'use client';

import type { IngestionResult as IngestionResultType } from '../../types/api';
import Link from 'next/link';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface IngestionResultProps {
  result: IngestionResultType;
}

export function IngestionResult({ result }: IngestionResultProps) {
  const [showErrors, setShowErrors] = useState(false);

  const getHeaderConfig = () => {
    if (result.errorCount === 0) {
      return {
        icon: <CheckCircle size={32} className="text-green-600" />,
        title: 'Upload Successful',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }
    if (result.successCount > 0) {
      return {
        icon: <AlertCircle size={32} className="text-yellow-600" />,
        title: 'Upload Completed with Errors',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    }
    return {
      icon: <XCircle size={32} className="text-red-600" />,
      title: 'Upload Failed',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    };
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] space-y-6">
      <div className={`flex items-center gap-3 p-4 rounded-lg ${headerConfig.bgColor} border ${headerConfig.borderColor}`}>
        {headerConfig.icon}
        <h3 className="text-lg font-semibold text-[#0f172a]">{headerConfig.title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-[#475569]">Batch ID</p>
          <p className="font-mono text-sm text-[#0f172a]">{result.batchId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#475569]">Total Rows</p>
            <p className="font-medium text-[#0f172a]">{result.totalRows}</p>
          </div>
          <div>
            <p className="text-sm text-[#475569]">Successfully Processed</p>
            <p className="font-medium text-green-600">{result.successCount}</p>
          </div>
        </div>

        {result.errorCount > 0 && (
          <div>
            <p className="text-sm text-[#475569]">Failed Rows</p>
            <p className="font-medium text-red-600">{result.errorCount}</p>
          </div>
        )}

        {result.errors.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowErrors(!showErrors)}
              className="flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline"
            >
              {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              View Row Errors ({result.errors.length})
            </button>
            {showErrors && (
              <div className="mt-3 max-h-64 overflow-y-auto border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="text-left text-xs font-medium text-[#475569] pb-2">Row</th>
                      <th className="text-left text-xs font-medium text-[#475569] pb-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error, index) => (
                      <tr key={index} className="border-b border-[#e2e8f0] last:border-0">
                        <td className="py-2 text-[#0f172a]">{error.row}</td>
                        <td className="py-2 text-red-600">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-[#1e3a5f] border border-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-colors"
        >
          Upload Another File
        </button>
<Link
           href="/batches"
           className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5a9e] transition-colors"
         >
           View Batch
         </Link>
      </div>
    </div>
  );
}