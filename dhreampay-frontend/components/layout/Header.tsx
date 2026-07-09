'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Menu, UserCircle } from 'lucide-react';

interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export function Header({ pageTitle = 'Dashboard', userName, userEmail, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-[#1e3a5f] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between w-full px-4 sm:px-6 sticky top-0 z-20">
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
        <h2 className="text-lg sm:text-xl font-semibold text-white truncate">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{userName ?? ''}</p>
            <p className="text-xs text-white/70">{userEmail ?? ''}</p>
          </div>
        </div>
        <button
          className="sm:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="User menu"
          disabled
        >
          <UserCircle size={20} />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sm:hidden p-2 text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0f172a] rounded-lg transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={20} />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#d4a017] border border-[#d4a017] rounded-lg hover:bg-[#d4a017] hover:text-[#0f172a] transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}