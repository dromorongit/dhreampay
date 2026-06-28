import { auth } from '../../../lib/auth/authOptions';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-600',
  reconciler: 'bg-blue-600',
  viewer: 'bg-gray-600',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const roleColor = roleColors[session.user.role] ?? 'bg-gray-600';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">
        Welcome back, {session.user.name}
      </h1>
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${roleColor}`}>
        {session.user.role}
      </span>
    </div>
  );
}