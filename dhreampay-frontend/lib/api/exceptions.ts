import { apiRequest } from './client';
import type { PaginatedResponse, Exception, ApiResponse } from '../../types/api';

interface GetExceptionsParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  exceptionType?: string;
}

export async function getExceptions(
  token: string,
  params?: GetExceptionsParams
): Promise<PaginatedResponse<Exception>> {
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
  if (params?.severity !== undefined) {
    queryParams.append('severity', params.severity);
  }
  if (params?.exceptionType !== undefined) {
    queryParams.append('exceptionType', params.exceptionType);
  }

  const queryString = queryParams.toString();
  const path = `/api/exceptions${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<Exception[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<Exception>).pagination;

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

interface UpdateExceptionData {
  status?: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

export async function updateException(
  token: string,
  id: string,
  data: UpdateExceptionData
): Promise<ApiResponse<Exception>> {
  const response = await apiRequest<Exception>(`/api/exceptions/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });

  return response;
}