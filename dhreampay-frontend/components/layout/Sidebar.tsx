'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, ArrowLeftRight, GitMerge, AlertTriangle, Star, BarChart2, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Batches', href: '/batches', icon: <FileText size={20} /> },
  { label: 'Transactions', href: '/transactions', icon: <ArrowLeftRight size={20} /> },
  { label: 'Reconciliation', href: '/reconciliation', icon: <GitMerge size={20} /> },
  { label: 'Exceptions', href: '/exceptions', icon: <AlertTriangle size={20} /> },
  { label: 'VIP Accounts', href: '/vip-accounts', icon: <Star size={20} /> },
  { label: 'Reports', href: '/reports', icon: <BarChart2 size={20} /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Users', href: '/users', icon: <Users size={20} /> },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#1e3a5f] fixed left-0 top-0 flex flex-col">
      <div className="flex justify-center p-6 border-b border-[#2d5a9e]">
        <Image src="/images/dhreampaylogo.jpg" alt="DhreamPay" width={320} height={100} className="w-full max-w-[240px] h-auto" />
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#d4a017] border-l-4 border-[#d4a017] bg-[rgba(212,160,23,0.1)]'
                      : 'text-white hover:text-white hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  <span className={isActive ? 'text-[#d4a017]' : 'text-white'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          {userRole === 'admin' && adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#d4a017] border-l-4 border-[#d4a017] bg-[rgba(212,160,23,0.1)]'
                      : 'text-white hover:text-white hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  <span className={isActive ? 'text-[#d4a017]' : 'text-white'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#2d5a9e]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1e3a5f] border border-[#d4a017] rounded-lg">
          <UserCircle size={24} className="text-[#d4a017]" />
          <span className="text-sm font-medium text-[#d4a017] capitalize">
            {userRole ?? 'viewer'}
          </span>
        </div>
      </div>
    </aside>
  );
}