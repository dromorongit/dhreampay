import { apiRequest } from './client';
import type { DashboardSummary } from '../../types/settlementBatch';

export async function getDashboardSummary(token: string): Promise<DashboardSummary> {
  const response = await apiRequest<DashboardSummary>('/api/reporting/dashboard', {
    token,
  });

  return {
    totalBatches: response.data?.totalBatches ?? 0,
    totalTransactions: response.data?.totalTransactions ?? 0,
    overallMatchRate: response.data?.overallMatchRate ?? 0,
    openExceptions: response.data?.openExceptions ?? 0,
    highSeverityExceptions: response.data?.highSeverityExceptions ?? 0,
    recentBatches: response.data?.recentBatches ?? [],
  };
}