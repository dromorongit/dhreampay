'use client'

import { Eye, Trash2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TransactionTableProps {
  transactions: Transaction[]
  loading: boolean
  onView: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
  canDelete: boolean
}

interface Transaction {
  _id: string
  transactionRef: string
  cardNumber: string
  cardHolderName: string
  amount: number
  currency?: string
  transactionDate: string
  transactionType: string
  status: string
  source: string
  isVIP: boolean
}

export function TransactionTable({ transactions, loading, onView, onDelete, canDelete }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="border border-dhreampay-border rounded-lg overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b border-dhreampay-border last:border-0">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dhreampay-border/30 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-dhreampay-border/30 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="border border-dhreampay-border rounded-lg p-12 text-center">
        <p className="text-dhreampay-text-secondary">No transactions yet. Upload your first batch to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-dhreampay-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-dhreampay-border/30">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Transaction Ref</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Card Holder</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Card Number</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Source</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Status</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">Date</th>
            <th className="px-4 py-3 text-left font-medium text-dhreampay-text-primary">VIP</th>
            <th className="px-4 py-3 text-right font-medium text-dhreampay-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dhreampay-border">
          {transactions.map(tx => (
            <tr key={tx._id} className="hover:bg-dhreampay-border/20 transition-colors">
              <td className="px-4 py-3 font-mono text-dhreampay-text-primary">
                {tx.transactionRef}
              </td>
              <td className="px-4 py-3 text-dhreampay-text-primary">{tx.cardHolderName}</td>
              <td className="px-4 py-3 font-mono text-dhreampay-text-secondary">
                {tx.cardNumber}
              </td>
              <td className="px-4 py-3 text-dhreampay-text-primary font-semibold">
                {tx.currency || 'USD'} {tx.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={tx.source === 'VISA' ? 'default' : 'secondary'}>
                  {tx.source}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={
                    tx.status === 'PENDING' ? 'warning' :
                    tx.status === 'MATCHED' || tx.status === 'SETTLED' ? 'success' :
                    'danger'
                  }
                >
                  {tx.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-dhreampay-text-secondary">
                {new Date(tx.transactionDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {tx.isVIP && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(tx)}
                    className="p-1.5 text-dhreampay-text-secondary hover:text-dhreampay-gold rounded-md transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => onDelete(tx._id)}
                      className="p-1.5 text-dhreampay-text-secondary hover:text-red-500 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}