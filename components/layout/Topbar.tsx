'use client'

import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title?: string
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-dhreampay-error',
  RECONCILIATION_OFFICER: 'bg-dhreampay-info',
  VIP_DESK: 'bg-dhreampay-gold',
  AUDITOR: 'bg-dhreampay-success',
}

export function Topbar({ title = 'Dashboard' }: TopbarProps) {
  const { user } = useAuth()

  return (
    <header className='h-16 bg-dhreampay-sidebar border-b border-dhreampay-border flex items-center justify-between px-6 ml-[260px]'>
      <h1 className='text-dhreampay-text-primary text-xl font-semibold'>{title}</h1>
      
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-3'>
          <div className='text-right'>
            <p className='text-dhreampay-text-primary font-medium'>{user?.name || 'User'}</p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full text-white ${user?.role ? roleColors[user.role] : 'bg-gray-500'}`}>
              {user?.role?.replace('_', ' ') || 'Unknown'}
            </span>
          </div>
          <div className='w-10 h-10 bg-dhreampay-gold rounded-full flex items-center justify-center'>
            <span className='text-dhreampay-primary font-bold text-sm'>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <Button
          variant='outline'
          size='sm'
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='border-dhreampay-border text-dhreampay-text-secondary hover:bg-dhreampay-border'
        >
          Logout
        </Button>
      </div>
    </header>
  )
}