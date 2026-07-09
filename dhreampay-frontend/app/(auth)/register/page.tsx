'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { checkBootstrapStatus, bootstrapRegister } from '../../lib/api/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkBootstrapStatus().then((response) => {
      if (response.data?.adminExists) {
        router.replace('/login');
      }
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await bootstrapRegister(name, email, password);
      const { accessToken, refreshToken, user } = response.data ?? {};

      if (accessToken && refreshToken) {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        router.push('/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      if (message.includes('admin account already exists')) {
        setTimeout(() => router.replace('/login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#d4a017] rounded-2xl shadow-lg p-8 flex justify-center items-center min-h-[200px]">
          <div className="text-[#475569]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#d4a017] rounded-2xl shadow-lg p-8">
        <Image src="/images/dhreampaylogo.jpg" alt="DhreamPay" width={150} height={48} className="h-12 w-auto mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-2">Set Up Admin Account</h2>
        <p className="text-center text-sm text-[#475569] mb-6">
          This is a one-time setup. This will be the primary administrator account for DhreamPay.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#475569] mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-md text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:opacity-50"
              placeholder="John Doe"
            />
          </div>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#475569] mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}