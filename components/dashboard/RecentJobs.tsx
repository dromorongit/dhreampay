'use client'

interface ReconciliationJob {
  _id: string
  jobName: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  totalTransactions: number
  totalMatched: number
  totalUnmatched: number
  totalVIP: number
  startedAt: string
  completedAt?: string
  triggeredBy: string
}

interface RecentJobsProps {
  jobs: ReconciliationJob[]
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  const statusColors = {
    RUNNING: 'text-dhreampay-info',
    COMPLETED: 'text-dhreampay-success',
    FAILED: 'text-dhreampay-error',
    CANCELLED: 'text-dhreampay-text-secondary',
  }

  return (
    <div className="bg-dhreampay-card border border-dhreampay-border rounded-lg p-6">
      <h3 className="text-dhreampay-text-primary text-lg font-semibold mb-4">Recent Jobs</h3>
      {jobs.length === 0 ? (
        <p className="text-dhreampay-text-secondary">No recent jobs</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="flex items-center justify-between p-3 bg-dhreampay-primary rounded-lg">
              <div>
                <p className="text-dhreampay-text-primary font-medium">{job.jobName}</p>
                <p className="text-dhreampay-text-secondary text-sm">
                  {new Date(job.startedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-sm font-medium ${statusColors[job.status]}`}>{job.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}