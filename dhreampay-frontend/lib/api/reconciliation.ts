import { apiRequest } from './client';
import type { ApiResponse, PaginatedResponse } from '../../types/api';
import type { MatchingSummary, ReconciliationRecord } from '../../types/api';

interface ReconciliationRecordsParams {
  page?: number;
  limit?: number;
  matchStatus?: string;
  settlementBatchId?: string;
}

export async function triggerReconciliation(
  token: string,
  batchId: string
): Promise<ApiResponse<MatchingSummary>> {
  return apiRequest<MatchingSummary>('/api/reconciliation/trigger', {
    method: 'POST',
    token,
    body: JSON.stringify({ batchId }),
  });
}

export async function getBatchReconciliationStatus(
  token: string,
  batchId: string
): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>(`/api/reconciliation/status/${batchId}`, {
    method: 'GET',
    token,
  });
}

export async function getReconciliationRecords(
  token: string,
  params?: ReconciliationRecordsParams
): Promise<PaginatedResponse<ReconciliationRecord>> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.matchStatus !== undefined) {
    queryParams.append('matchStatus', params.matchStatus);
  }
  if (params?.settlementBatchId !== undefined) {
    queryParams.append('settlementBatchId', params.settlementBatchId);
  }

  const queryString = queryParams.toString();
  const path = `/api/reconciliation-records${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<ReconciliationRecord[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<ReconciliationRecord>).pagination;

  return {
    success: response.success,
    data: response.data ?? [],
    pagination: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
      total: pagination?.total ?? 0,
      totalPages: pagination?.totalPages ?? 0,
    },
  };
}