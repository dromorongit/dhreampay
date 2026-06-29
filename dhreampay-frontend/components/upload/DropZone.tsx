'use client';

import { useState, useCallback, type DragEvent, type ChangeEvent, useMemo } from 'react';
import { Upload, X } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSizeMB: number;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, accept, maxSizeMB, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const acceptedExtensions = useMemo(
    () => accept.split(',').map((a) => a.trim().replace('.', '')),
    [accept]
  );

  const validateAndSelectFile = useCallback(
    (file: File | null) => {
      if (!file) return;

      setError(null);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';

      if (!acceptedExtensions.includes(fileExtension)) {
        setError('Invalid file type. Only CSV and XLSX files are accepted.');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [acceptedExtensions, maxSizeMB, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        const file = e.dataTransfer.files[0];
        validateAndSelectFile(file);
      }
    },
    [disabled, validateAndSelectFile]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      validateAndSelectFile(file);
    },
    [validateAndSelectFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          disabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
            : isDragOver
            ? 'border-[#d4a017] bg-[rgba(212,160,23,0.05)]'
            : 'border-[#e2e8f0] hover:border-[#d4a017]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-[#0f172a]">{selectedFile.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <span className="text-xs text-[#475569]">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ) : (
          <>
            <Upload size={48} className="mx-auto text-[#1e3a5f] mb-4" />
            <p className="text-[#0f172a] font-medium">Drag and drop your file here</p>
            <p className="text-sm text-[#475569] mt-1">or click to browse</p>
            <p className="text-xs text-[#475569] mt-2">
              Accepted formats: .csv, .xlsx (up to {maxSizeMB}MB)
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
                className="mt-4 px-4 py-2 text-sm text-[#1e3a5f] border border-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-colors"
              >
                Browse Files
              </button>
            )}
          </>
        )}
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}