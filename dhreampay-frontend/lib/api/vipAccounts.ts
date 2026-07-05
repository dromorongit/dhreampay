import { apiRequest } from './client';
import type { PaginatedResponse, VIPAccount, ApiResponse, CreateVIPAccountDTO, UpdateVIPAccountDTO } from '../../types/api';

interface GetVIPAccountsParams {
  page?: number;
  limit?: number;
  vipTier?: string;
  isActive?: boolean;
  search?: string;
}

export async function getVIPAccounts(
  token: string,
  params?: GetVIPAccountsParams
): Promise<PaginatedResponse<VIPAccount>> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.vipTier !== undefined) {
    queryParams.append('vipTier', params.vipTier);
  }
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }
  if (params?.search !== undefined) {
    queryParams.append('search', params.search);
  }

  const queryString = queryParams.toString();
  const path = `/api/vip-accounts${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<VIPAccount[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<VIPAccount>).pagination;

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

export async function getVIPAccountById(
  token: string,
  id: string
): Promise<ApiResponse<VIPAccount>> {
  const response = await apiRequest<VIPAccount>(`/api/vip-accounts/${id}`, {
    token,
  });

  return response;
}

export async function createVIPAccount(
  token: string,
  data: CreateVIPAccountDTO
): Promise<ApiResponse<VIPAccount>> {
  const response = await apiRequest<VIPAccount>('/api/vip-accounts', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });

  return response;
}

export async function updateVIPAccount(
  token: string,
  id: string,
  data: UpdateVIPAccountDTO
): Promise<ApiResponse<VIPAccount>> {
  const response = await apiRequest<VIPAccount>(`/api/vip-accounts/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });

  return response;
}

export async function deleteVIPAccount(
  token: string,
  id: string
): Promise<ApiResponse<null>> {
  const response = await apiRequest<null>(`/api/vip-accounts/${id}`, {
    method: 'DELETE',
    token,
  });

  return response;
}