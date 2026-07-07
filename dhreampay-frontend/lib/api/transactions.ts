import { apiRequest } from './client';
import type { PaginatedResponse, Transaction } from '../../types/api';

interface GetTransactionsParams {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  isVIP?: boolean;
  dateFrom?: string;
  dateTo?: string;
  settlementBatchId?: string;
}

export async function getTransactions(
  token: string,
  params?: GetTransactionsParams
): Promise<PaginatedResponse<Transaction>> {
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
  if (params?.source !== undefined) {
    queryParams.append('source', params.source);
  }
  if (params?.isVIP !== undefined) {
    queryParams.append('isVIP', String(params.isVIP));
  }
  if (params?.dateFrom !== undefined) {
    queryParams.append('dateFrom', params.dateFrom);
  }
  if (params?.dateTo !== undefined) {
    queryParams.append('dateTo', params.dateTo);
  }
  if (params?.settlementBatchId !== undefined) {
    queryParams.append('settlementBatchId', params.settlementBatchId);
  }

  const queryString = queryParams.toString();
  const path = `/api/transactions${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<Transaction[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<Transaction>).pagination;

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

export async function getTransactionById(
  token: string,
  id: string
): Promise<{ success: boolean; data?: Transaction; message?: string }> {
  const response = await apiRequest<Transaction>(`/api/transactions/${id}`, {
    token,
  });

  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}