'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CreditCard, GitMerge, AlertTriangle, Star, Banknote, FileText, Shield, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const iconMap = {
  LayoutDashboard,
  CreditCard,
  GitMerge,
  AlertTriangle,
  Star,
  Banknote,
  FileText,
  Shield,
  Users,
}

interface SidebarItem {
  label: string
  icon: keyof typeof iconMap
  href: string
  roles: string[]
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'VIP_DESK', 'AUDITOR'] },
  { label: 'Transactions', icon: 'CreditCard', href: '/dashboard/transactions', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'] },
  { label: 'Reconciliation', icon: 'GitMerge', href: '/dashboard/reconciliation', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'] },
  { label: 'Exceptions', icon: 'AlertTriangle', href: '/dashboard/exceptions', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'] },
  { label: 'VIP Transactions', icon: 'Star', href: '/dashboard/vip', roles: ['ADMIN', 'VIP_DESK', 'AUDITOR'] },
  { label: 'Settlement', icon: 'Banknote', href: '/dashboard/settlement', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'] },
  { label: 'Reports', icon: 'FileText', href: '/dashboard/reports', roles: ['ADMIN', 'RECONCILIATION_OFFICER', 'AUDITOR'] },
  { label: 'Audit Logs', icon: 'Shield', href: '/dashboard/audit', roles: ['ADMIN', 'AUDITOR'] },
  { label: 'User Management', icon: 'Users', href: '/dashboard/users', roles: ['ADMIN'] },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed: externalCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isCollapsed = externalCollapsed ?? collapsed

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setCollapsed(!collapsed)
    }
  }

  const filteredItems = sidebarItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-dhreampay-sidebar transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-[260px]'}`}>
      <div className='flex flex-col h-full'>
        <div className='flex items-center h-16 px-4 border-b border-dhreampay-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-dhreampay-gold rounded-lg flex items-center justify-center flex-shrink-0'>
              <span className='text-dhreampay-primary font-bold text-xl'>D</span>
            </div>
            {!isCollapsed && (
              <span className='text-dhreampay-text-primary font-semibold text-xl'>DhreamPay</span>
            )}
          </div>
        </div>

        <nav className='flex-1 py-4 overflow-y-auto'>
          {filteredItems.map(item => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-dhreampay-gold text-dhreampay-primary' : 'text-dhreampay-text-secondary hover:bg-dhreampay-border hover:text-dhreampay-text-primary'}`}>
                <Icon className='w-5 h-5 flex-shrink-0' />
                {!isCollapsed && <span className='font-medium'>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className='p-4 border-t border-dhreampay-border'>
          <button
            onClick={handleToggle}
            className='w-full flex items-center justify-center gap-2 px-4 py-2 text-dhreampay-text-secondary hover:text-dhreampay-text-primary hover:bg-dhreampay-border rounded-md transition-colors'>
            {isCollapsed ? <ChevronRight className='w-5 h-5' /> : <ChevronLeft className='w-5 h-5' />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
