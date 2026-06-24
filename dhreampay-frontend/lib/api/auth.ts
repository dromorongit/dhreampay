import { apiRequest } from './client';
import { AuthResponse, ApiResponse } from '../../types/api';

export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}