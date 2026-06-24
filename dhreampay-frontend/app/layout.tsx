import type { Metadata } from 'next';
import { SessionProvider } from '../components/providers/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DhreamPay',
  description: 'Visa Card Reconciliation & Settlement System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}