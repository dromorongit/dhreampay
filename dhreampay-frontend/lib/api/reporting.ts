import { apiRequest } from './client';
import type { DashboardSummary, BatchSummaryReport } from '../../types/settlementBatch';
import type { ApiResponse } from '../../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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

export async function getBatchSummary(
  token: string,
  batchId: string
): Promise<BatchSummaryReport> {
  const response = await apiRequest<BatchSummaryReport>(`/api/reporting/batch/${batchId}/summary`, {
    token,
  });

  return response.data!;
}

export async function exportBatchReport(
  token: string,
  params: {
    batchId: string;
    format: 'xlsx' | 'csv';
    includeExceptions?: boolean;
    includeUnmatched?: boolean;
  }
): Promise<{ blob: Blob; filename: string }> {
  const queryParams = new URLSearchParams();
  queryParams.append('batchId', params.batchId);
  queryParams.append('format', params.format);
  if (params.includeExceptions !== undefined) {
    queryParams.append('includeExceptions', String(params.includeExceptions));
  } else {
    queryParams.append('includeExceptions', 'true');
  }
  if (params.includeUnmatched !== undefined) {
    queryParams.append('includeUnmatched', String(params.includeUnmatched));
  } else {
    queryParams.append('includeUnmatched', 'true');
  }

  const response = await fetch(`${API_BASE_URL}/api/reporting/batch/export?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'export';
  if (contentDisposition !== null) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch !== null) {
      filename = filenameMatch[1];
    }
  }

  if (!response.ok) {
    const errorData = (await response.json()) as ApiResponse<null>;
    throw new Error(errorData.message ?? response.statusText ?? 'Export failed');
  }

  const blob = await response.blob();
  return { blob, filename };
}