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

export interface BootstrapStatusResponse {
  adminExists: boolean;
}

export async function checkBootstrapStatus(): Promise<ApiResponse<BootstrapStatusResponse>> {
  return apiRequest<BootstrapStatusResponse>('/api/auth/bootstrap-status', {
    method: 'GET',
  });
}

export async function bootstrapRegister(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/api/auth/bootstrap-register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}