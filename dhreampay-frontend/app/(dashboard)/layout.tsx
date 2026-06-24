import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth/authOptions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="w-64 bg-gray-950 p-4">
        <nav className="text-gray-400">
          <div className="mb-4 text-gray-500 text-xs uppercase">Navigation</div>
          <ul className="space-y-2">
            <li>
              <a href="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}