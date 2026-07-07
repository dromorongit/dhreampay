'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { getUsers } from '@/lib/api/users';
import { UsersTable } from '@/components/users/UsersTable';
import { UserModal } from '@/components/users/UserModal';
import type { User } from '@/types/api';

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? 'viewer';
  const token = session?.user?.accessToken ?? '';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | null>(null);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await getUsers(token, { limit: 50 });
      setUsers(response.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-[#475569]">
            You do not have permission to access this page. Contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-[#475569] mt-1">Create and manage accounts for your team</p>
        </div>
        <button
          onClick={() => setModalMode('create')}
          className="bg-[#d4a017] text-white px-4 py-2 rounded-lg hover:bg-[#b88a10] transition-colors"
        >
          Add User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-[#475569]">Loading users...</p>
        </div>
      ) : (
        <UsersTable users={users} token={token} onUserChange={loadUsers} />
      )}

      <UserModal
        mode={modalMode}
        user={null}
        token={token}
        onClose={() => setModalMode(null)}
        onSaved={loadUsers}
      />
    </div>
  );
}