'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
}

export function Header({ pageTitle = 'Dashboard', userName, userEmail }: HeaderProps) {
  return (
    <header className="h-16 bg-[#1e3a5f] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-6 ml-64">
      <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{userName ?? ''}</p>
            <p className="text-xs text-white/70">{userEmail ?? ''}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#d4a017] border border-[#d4a017] rounded-lg hover:bg-[#d4a017] hover:text-[#0f172a] transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
}