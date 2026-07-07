import { apiRequest } from './client';
import type { PaginatedResponse, ApiResponse, User, CreateUserDTO, UpdateUserDTO } from '../../types/api';

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'reconciler' | 'viewer';
  isActive?: boolean;
}

export async function getUsers(
  token: string,
  params?: GetUsersParams
): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.role !== undefined) {
    queryParams.append('role', params.role);
  }
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }

  const queryString = queryParams.toString();
  const path = `/api/users${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<User[]>(path, {
    token,
  });

  const pagination = (response as unknown as PaginatedResponse<User>).pagination;

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

export async function getUserById(
  token: string,
  id: string
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/api/users/${id}`, {
    token,
  });
}

export async function createUser(
  token: string,
  data: CreateUserDTO
): Promise<ApiResponse<User>> {
  return apiRequest<User>('/api/users', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  token: string,
  id: string,
  data: UpdateUserDTO
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/api/users/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}

export async function deactivateUser(
  token: string,
  id: string
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/api/users/${id}/deactivate`, {
    method: 'PATCH',
    token,
  });
}