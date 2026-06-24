/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UserRole } from '../../types/api';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      accessToken: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }

  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}