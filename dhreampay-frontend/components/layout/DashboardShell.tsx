'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardShellProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function DashboardShell({ userRole, userName, userEmail, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white w-full overflow-x-hidden">
      <Sidebar
        userRole={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:ml-64 flex flex-col flex-1 w-full max-w-full overflow-x-hidden">
        <Header
          pageTitle="DhreamPay"
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden bg-white w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}