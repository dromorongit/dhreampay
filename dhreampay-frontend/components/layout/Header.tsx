'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export function Header({ pageTitle = 'Dashboard', userName, userEmail, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-[#1e3a5f] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-white" />
          </button>
        )}
        <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>
      </div>

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