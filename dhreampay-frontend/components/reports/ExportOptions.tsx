'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportBatchReport } from '@/lib/api/reporting';

interface ExportOptionsProps {
  batchId: string;
  token: string;
  userRole: string;
}

export function ExportOptions({ batchId, token, userRole }: ExportOptionsProps) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeExceptions, setIncludeExceptions] = useState(true);
  const [includeUnmatched, setIncludeUnmatched] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userRole === 'viewer') {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center">
          Export is available to Admin and Reconciler roles only.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const { blob, filename } = await exportBatchReport(token, {
        batchId,
        format,
        includeExceptions,
        includeUnmatched,
      });

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] space-y-4">
      <h2 className="text-lg font-semibold text-[#0f172a]">Export Report</h2>

      <div>
        <p className="text-sm font-medium text-[#475569] mb-2">Format</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormat('xlsx')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              format === 'xlsx'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]'
            }`}
          >
            XLSX
          </button>
          <button
            type="button"
            onClick={() => setFormat('csv')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              format === 'csv'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]'
            }`}
          >
            CSV
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeExceptions}
            onChange={(e) => setIncludeExceptions(e.target.checked)}
            className="w-4 h-4 text-[#1e3a5f] border-[#e2e8f0] rounded focus:ring-[#1e3a5f]"
          />
          <span className="text-sm text-[#0f172a]">Include Exceptions</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeUnmatched}
            onChange={(e) => setIncludeUnmatched(e.target.checked)}
            className="w-4 h-4 text-[#1e3a5f] border-[#e2e8f0] rounded focus:ring-[#1e3a5f]"
          />
          <span className="text-sm text-[#0f172a]">Include Unmatched</span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-[#d4a017] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b88b15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Download size={16} />
        {downloading ? 'Downloading...' : 'Download'}
      </button>

      {error !== null && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}