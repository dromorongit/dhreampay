import './globals.css'
import type { Metadata } from 'next'
import { SessionProvider } from '@/components/session-provider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'DhreamPay',
  description: 'Visa Card and VIP Transaction Reconciliation and Settlement System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}