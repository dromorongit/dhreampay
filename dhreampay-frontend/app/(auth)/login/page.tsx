'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { checkBootstrapStatus } from '@/lib/api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkBootstrapStatus().then((response) => {
      setShowRegisterLink(response.data?.adminExists === false);
    }).catch(() => {
      setShowRegisterLink(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#d4a017] rounded-2xl shadow-lg p-8">
<Image src="/images/dhreampaylogo.jpg" alt="DhreamPay" width={150} height={48} className="h-12 w-auto mx-auto mb-4" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#475569] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-md text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:opacity-50"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#475569] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-md text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#1e3a5f] hover:bg-[#2d5a9e] rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {showRegisterLink && (
          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-slate-500 hover:text-[#1e3a5f]">
              First time setup? Create admin account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}