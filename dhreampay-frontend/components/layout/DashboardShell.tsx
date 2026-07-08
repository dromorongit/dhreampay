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
    <div className="flex min-h-screen bg-white">
      <Sidebar
        userRole={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header
          pageTitle="DhreamPay"
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}