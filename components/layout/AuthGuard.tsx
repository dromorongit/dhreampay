'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: Array<'ADMIN' | 'RECONCILIATION_OFFICER' | 'VIP_DESK' | 'AUDITOR'>
}

export default function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRoles && session.user?.role) {
      if (!requiredRoles.includes(session.user.role as any)) {
        return
      }
    }
  }, [status, session, router, requiredRoles])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F59E0B] border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRoles && session.user?.role) {
    if (!requiredRoles.includes(session.user.role as any)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#EF4444]">Access Denied</h2>
            <p className="mt-2 text-[#94A3B8]">You do not have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}