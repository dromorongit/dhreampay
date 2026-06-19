'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as 'ADMIN' | 'RECONCILIATION_OFFICER' | 'VIP_DESK' | 'AUDITOR',
  } : null

  const isAdmin = user?.role === 'ADMIN'
  const isReconciliationOfficer = user?.role === 'RECONCILIATION_OFFICER'
  const isVIPDesk = user?.role === 'VIP_DESK'
  const isAuditor = user?.role === 'AUDITOR'

  return {
    user,
    status,
    isAuthenticated: !!user,
    isAdmin,
    isReconciliationOfficer,
    isVIPDesk,
    isAuditor,
  }
}