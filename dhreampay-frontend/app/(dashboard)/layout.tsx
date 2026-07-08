import { auth } from '../../lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { DashboardShell } from '../../components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell
      userRole={session.user.role}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardShell>
  );
}