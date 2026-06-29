import { auth } from '../../lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';

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
    <div className="flex min-h-screen bg-white">
      <Sidebar userRole={session.user.role} />
      <div className="ml-64 flex flex-col flex-1">
        <Header pageTitle="DhreamPay" userName={session.user.name} userEmail={session.user.email} />
        <main className="flex-1 p-6 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}