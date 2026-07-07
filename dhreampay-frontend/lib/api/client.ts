import type { ApiResponse } from '../../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiRequest<T>(path: string, options?: RequestInit & { token?: string }): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Note: A 401 response after the JWT refresh logic in NextAuth is in place
  // indicates the refresh token itself has expired. The SessionErrorHandler
  // will catch this on the next session check and sign the user out.
  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    const errorMessage =
      data.message ?? response.statusText ?? 'An error occurred';
    throw new Error(errorMessage);
  }

  return data;
}