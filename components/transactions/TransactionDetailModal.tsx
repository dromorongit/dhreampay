'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TransactionDetailModalProps {
  transaction: Transaction | null
  onClose: () => void
}

interface Transaction {
  _id: string
  transactionRef: string
  cardNumber: string
  cardHolderName: string
  amount: number
  currency: string
  transactionDate: string
  settlementDate?: string
  merchantName?: string
  merchantCode?: string
  transactionType: string
  status: string
  source: string
  isVIP: boolean
  batchId: string
  createdAt: string
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dhreampay-primary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dhreampay-border">
          <h2 className="text-xl font-semibold text-dhreampay-text-primary">Transaction Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-dhreampay-text-secondary hover:text-dhreampay-text-primary rounded-md hover:bg-dhreampay-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Transaction Reference</p>
              <p className="font-mono text-dhreampay-text-primary">{transaction.transactionRef}</p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Card Number</p>
              <p className="font-mono text-dhreampay-text-primary">{transaction.cardNumber}</p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Card Holder</p>
              <p className="text-dhreampay-text-primary">{transaction.cardHolderName}</p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Amount</p>
              <p className="text-dhreampay-text-primary font-semibold">
                {transaction.currency} {transaction.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Transaction Date</p>
              <p className="text-dhreampay-text-primary">
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Transaction Type</p>
              <Badge variant="secondary">{transaction.transactionType}</Badge>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Source</p>
              <Badge variant={transaction.source === 'VISA' ? 'default' : 'secondary'}>
                {transaction.source}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Status</p>
              <Badge 
                variant={
                  transaction.status === 'PENDING' ? 'warning' :
                  transaction.status === 'MATCHED' ? 'success' :
                  transaction.status === 'SETTLED' ? 'success' :
                  'danger'
                }
              >
                {transaction.status}
              </Badge>
            </div>
            {transaction.isVIP && (
              <div className="md:col-span-2">
                <Badge variant="warning">VIP Transaction</Badge>
              </div>
            )}
            {transaction.merchantName && (
              <div>
                <p className="text-sm text-dhreampay-text-secondary">Merchant</p>
                <p className="text-dhreampay-text-primary">{transaction.merchantName}</p>
              </div>
            )}
            {transaction.merchantCode && (
              <div>
                <p className="text-sm text-dhreampay-text-secondary">Merchant Code</p>
                <p className="font-mono text-dhreampay-text-primary">{transaction.merchantCode}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Batch ID</p>
              <p className="font-mono text-dhreampay-text-primary">{transaction.batchId}</p>
            </div>
            <div>
              <p className="text-sm text-dhreampay-text-secondary">Created At</p>
              <p className="text-dhreampay-text-primary">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}