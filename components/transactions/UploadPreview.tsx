'use client'

import { Badge } from '@/components/ui/badge'

interface PreviewRow {
  _id?: string
  transactionRef: string
  cardNumber: string
  cardHolderName: string
  amount: number
  currency: string
  transactionDate: string
  merchantName?: string
  merchantCode?: string
  transactionType: string
  isVIP?: boolean
  errors?: string[]
}

interface UploadPreviewProps {
  rows: PreviewRow[]
  mapping: Record<string, string>
}

export function UploadPreview({ rows, mapping }: UploadPreviewProps) {
  const displayRows = rows.slice(0, 10)
  const validCount = rows.filter(r => !r.errors?.length).length
  const invalidCount = rows.length - validCount

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            Valid: {validCount}
          </Badge>
          <Badge variant="outline" className="border-red-300 text-red-600">
            Invalid: {invalidCount}
          </Badge>
        </div>
        <p className="text-sm text-dhreampay-text-secondary">
          Showing first 10 of {rows.length} rows
        </p>
      </div>

      <div className="overflow-x-auto border border-dhreampay-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-dhreampay-border/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Transaction Ref</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Card Holder</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Date</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Type</th>
              <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">VIP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dhreampay-border">
            {displayRows.map((row, idx) => (
              <tr key={idx} className={row.errors?.length ? 'bg-red-50/10' : ''}>
                <td className="px-4 py-3">
                  {row.errors?.length ? (
                    <span className="text-red-600" title={row.errors.join('; ')}>
                      Invalid
                    </span>
                  ) : (
                    <span className="text-green-600">Valid</span>
                  )}
                </td>
                <td className="px-4 py-3 text-dhreampay-text-primary">{row.transactionRef || '-'}</td>
                <td className="px-4 py-3 text-dhreampay-text-primary">{row.cardHolderName || '-'}</td>
                <td className="px-4 py-3 text-dhreampay-text-primary">
                  {row.amount ? `${row.currency || 'USD'} ${row.amount.toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-dhreampay-text-primary">
                  {row.transactionDate ? new Date(row.transactionDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-dhreampay-text-primary">{row.transactionType || '-'}</td>
                <td className="px-4 py-3">
                  {row.isVIP && <span className="text-yellow-500 font-bold">VIP</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}