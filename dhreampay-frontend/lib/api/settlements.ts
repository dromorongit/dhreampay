import { apiRequest } from './client';
import type { PaginatedResponse } from '../../types/api';
import type { SettlementBatch } from '../../types/settlementBatch';

interface SettlementBatchesParams {
  page?: number;
  limit?: number;
  status?: string;
}

export async function getSettlementBatches(
  token: string,
  params?: SettlementBatchesParams
): Promise<PaginatedResponse<SettlementBatch>> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.status !== undefined) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const path = `/api/settlement-batches${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<SettlementBatch[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<SettlementBatch>).pagination;

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