export type UserRole = 'admin' | 'reconciler' | 'viewer';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface IngestionError {
  row: number;
  message: string;
}

export interface IngestionResult {
  batchId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: IngestionError[];
}

export interface Transaction {
  _id: string;
  transactionId: string;
  source: 'bank' | 'visa';
  transactionType: 'purchase' | 'refund' | 'reversal' | 'adjustment';
  cardNumberMasked: string;
  amount: number;
  currency: string;
  transactionDate: string;
  postingDate: string;
  merchantId: string;
  terminalId?: string;
  authorizationCode?: string;
  isVIP: boolean;
  settlementBatchId?: string;
  status: 'unmatched' | 'matched' | 'exception' | 'resolved';
  createdAt: string;
}