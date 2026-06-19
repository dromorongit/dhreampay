'use client'

import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className='min-h-screen bg-dhreampay-primary'>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Topbar />
      <main className={'p-6 transition-all duration-300 ' + (sidebarCollapsed ? 'ml-20' : 'ml-[260px]')}>
        {children}
      </main>
    </div>
  )
}
