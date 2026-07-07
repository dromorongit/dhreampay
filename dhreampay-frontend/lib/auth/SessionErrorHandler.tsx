'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);

  return null;
}