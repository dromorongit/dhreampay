'use client'

interface Exception {
  _id: string
  transactionId: string
  exceptionType: 'UNMATCHED' | 'DUPLICATE' | 'AMOUNT_MISMATCH' | 'DATE_MISMATCH' | 'MISSING_REFERENCE' | 'VIP_REVIEW'
  reason: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED'
  resolvedBy?: string
  resolutionNote?: string
  resolvedAt?: string
  reconciliationJobId: string
}

interface RecentExceptionsProps {
  exceptions: Exception[]
}

export function RecentExceptions({ exceptions }: RecentExceptionsProps) {
  const severityColors = {
    LOW: 'text-dhreampay-success',
    MEDIUM: 'text-dhreampay-gold',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-dhreampay-error',
  }

  return (
    <div className="bg-dhreampay-card border border-dhreampay-border rounded-lg p-6">
      <h3 className="text-dhreampay-text-primary text-lg font-semibold mb-4">Recent Exceptions</h3>
      {exceptions.length === 0 ? (
        <p className="text-dhreampay-text-secondary">No recent exceptions</p>
      ) : (
        <div className="space-y-3">
          {exceptions.map((exception) => (
            <div key={exception._id} className="flex items-center justify-between p-3 bg-dhreampay-primary rounded-lg">
              <div>
                <p className="text-dhreampay-text-primary font-medium">{exception.exceptionType.replace('_', ' ')}</p>
                <p className="text-dhreampay-text-secondary text-sm truncate max-w-xs">{exception.reason}</p>
              </div>
              <span className={`text-sm font-medium ${severityColors[exception.severity]}`}>{exception.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}