import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '../components/providers/SessionProvider';
import { SessionErrorHandler } from '../lib/auth/SessionErrorHandler';
import './globals.css';

export const metadata: Metadata = {
  title: 'DhreamPay',
  description: 'Visa Card Reconciliation & Settlement System',
  icons: {
    icon: '/images/dhreampayfavi.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <SessionErrorHandler />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}