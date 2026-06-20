'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface UploadSummaryProps {
  importedCount: number
  skippedCount: number
  duplicateCount: number
  errorCount: number
}

export function UploadSummary({ importedCount, skippedCount, duplicateCount, errorCount }: UploadSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <div>
          <p className="text-2xl font-bold text-green-500">{importedCount}</p>
          <p className="text-sm text-dhreampay-text-secondary">Imported Successfully</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircle className="w-8 h-8 text-yellow-500" />
        <div>
          <p className="text-2xl font-bold text-yellow-500">{duplicateCount}</p>
          <p className="text-sm text-dhreampay-text-secondary">Duplicates Skipped</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <XCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-2xl font-bold text-red-500">{skippedCount + errorCount}</p>
          <p className="text-sm text-dhreampay-text-secondary">Rows with Errors</p>
        </div>
      </div>
    </div>
  )
}