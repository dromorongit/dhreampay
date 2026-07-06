export type BatchSource = 'bank' | 'visa';

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SettlementBatch {
  _id: string;
  batchId: string;
  batchDate: string;
  source: BatchSource;
  fileName: string;
  totalAmount: number;
  totalCount: number;
  status: BatchStatus;
  uploadedBy: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalBatches: number;
  totalTransactions: number;
  overallMatchRate: number;
  openExceptions: number;
  highSeverityExceptions: number;
  recentBatches: SettlementBatch[];
}

export interface BatchSummaryReport {
  batch: {
    _id: string;
    batchId: string;
    batchDate: string;
    source: string;
    fileName: string;
    totalAmount: number;
    totalCount: number;
    status: string;
    uploadedBy: string;
    createdAt: string;
  };
  totalTransactions: number;
  matched: number;
  partial: number;
  unmatched: number;
  exceptions: number;
  totalMatchedAmount: number;
  totalUnmatchedAmount: number;
  exceptionBreakdown: Record<string, number>;
  generatedAt: string;
}