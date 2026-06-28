import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '../../types/api';

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      accessToken: string;
      name: string;
      email: string;
    };
  }

  interface JWT {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
    name: string;
    email: string;
  }
}

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
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
        token.name = customUser.name;
        token.email = customUser.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accessToken = token.accessToken as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);