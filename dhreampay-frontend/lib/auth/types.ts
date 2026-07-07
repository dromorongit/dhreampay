import type { UserRole } from '../../types/api';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      accessToken: string;
      name: string;
      email: string;
    };
    error?: string;
  }

  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    name?: string | null;
    email?: string | null;
    error?: 'RefreshAccessTokenError';
  }
}