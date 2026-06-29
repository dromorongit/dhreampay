'use client';

import { useSession } from 'next-auth/react';
import { SourceSelector } from '../../../components/upload/SourceSelector';
import { DropZone } from '../../../components/upload/DropZone';
import { IngestionResult } from '../../../components/upload/IngestionResult';
import { uploadFile } from '../../../lib/api/ingestion';
import { useState } from 'react';
import type { IngestionResult as IngestionResultType } from '../../../types/api';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [source, setSource] = useState<'bank' | 'visa'>('bank');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<IngestionResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const role = session?.user?.role;

  if (role === 'viewer') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] max-w-md text-center">
          <Lock size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-[#0f172a] mb-2">Access Denied</h2>
          <p className="text-[#475569] mb-6">
            You do not have permission to upload files. Contact your administrator.
          </p>
          <Link
            href="/dashboard"
            className="text-sm text-[#1e3a5f] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !session?.user?.accessToken) return;

    setUploading(true);
    setError(null);

    try {
      const uploadResult = await uploadFile(selectedFile, source, session.user.accessToken);
      setResult(uploadResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto">
        <IngestionResult result={result} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Upload Settlement File</h1>
        <p className="text-[#475569]">Upload bank or Visa settlement files for reconciliation processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SourceSelector value={source} onChange={setSource} />
          <DropZone
            onFileSelect={handleFileSelect}
            accept=".csv,.xlsx"
            maxSizeMB={10}
            disabled={uploading}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              uploading || !selectedFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#1e3a5f] text-white hover:border-[#d4a017] border border-transparent'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span>
                Processing...
              </span>
            ) : (
              'Upload & Process File'
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">File Requirements</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="font-medium text-[#0f172a]">Accepted formats:</span>
                <span className="text-[#475569]"> CSV, XLSX</span>
              </li>
              <li>
                <span className="font-medium text-[#0f172a]">Max size:</span>
                <span className="text-[#475569]"> 10MB</span>
              </li>
              <li className="pt-2">
                <span className="font-medium text-[#0f172a]">Required columns for Bank files:</span>
                <ul className="mt-1 ml-4 text-[#475569] list-disc">
                  <li>transaction_id</li>
                  <li>card_number</li>
                  <li>amount</li>
                  <li>currency</li>
                  <li>transaction_date</li>
                  <li>posting_date</li>
                  <li>merchant_id</li>
                  <li>transaction_type</li>
                </ul>
              </li>
              <li className="pt-2">
                <span className="font-medium text-[#0f172a]">Required columns for Visa files:</span>
                <ul className="mt-1 ml-4 text-[#475569] list-disc">
                  <li>transaction_id</li>
                  <li>card_number</li>
                  <li>amount</li>
                  <li>currency</li>
                  <li>transaction_date</li>
                  <li>posting_date</li>
                  <li>merchant_id</li>
                  <li>transaction_type</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}