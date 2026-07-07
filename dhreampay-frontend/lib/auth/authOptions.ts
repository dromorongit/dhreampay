import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '../../types/api';
import './types';

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

type AugmentedJWT = {
  id?: string | null;
  role?: UserRole | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpires?: number | null;
  name?: string | null;
  email?: string | null;
  error?: 'RefreshAccessTokenError';
};

async function refreshAccessToken(token: AugmentedJWT): Promise<AugmentedJWT> {
  if (!apiUrl) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: { accessToken: string };
    };

    if (data.success && data.data) {
      return {
        ...token,
        accessToken: data.data.accessToken,
        accessTokenExpires: Date.now() + 14 * 60 * 1000,
      };
    }

    return { ...token, error: 'RefreshAccessTokenError' };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials): Promise<CustomUser | null> => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!apiUrl) {
          console.error('API_URL is not set');
          return null;
        }

        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as {
          success: boolean;
          data?: {
            user: { _id: string; name: string; email: string; role: UserRole };
            accessToken: string;
            refreshToken: string;
          };
        };

        if (data.success && data.data) {
          const { user, accessToken, refreshToken } = data.data;
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
        token.accessToken = customUser.accessToken;
        token.refreshToken = customUser.refreshToken;
        token.accessTokenExpires = Date.now() + 14 * 60 * 1000;
        token.name = customUser.name;
        token.email = customUser.email;
        return token;
      }

      const augmentedToken = token as AugmentedJWT;
      if (Date.now() < (augmentedToken.accessTokenExpires ?? 0)) {
        return token;
      }

      return refreshAccessToken(augmentedToken);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accessToken = token.accessToken as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      session.error = (token as AugmentedJWT).error;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);