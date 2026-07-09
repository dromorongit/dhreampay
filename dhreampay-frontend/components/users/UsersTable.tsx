'use client';

import { FC, useState } from 'react';
import type { User } from '../../types/api';
import { Badge } from '../ui/Badge';
import { UserModal } from './UserModal';
import { deactivateUser } from '@/lib/api/users';

interface UsersTableProps {
  users: User[];
  token: string;
  onUserChange: () => void;
}

const roleVariantMap: Record<User['role'], 'gold' | 'info' | 'default'> = {
  admin: 'gold',
  reconciler: 'info',
  viewer: 'default',
};

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const UsersTable: FC<UsersTableProps> = ({ users, token, onUserChange }) => {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      return;
    }

    try {
      await deactivateUser(token, user._id);
      onUserChange();
    } catch {
      // Error handled by parent
    }
  };

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleModalSaved = () => {
    setModalMode(null);
    setSelectedUser(null);
    onUserChange();
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
        <p className="text-[#475569] text-center py-8">No users found.</p>
      </div>
    );
  }

  return (
    <>
<div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden w-full max-w-full">
<div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[768px]">
            <thead>
              <tr className="bg-[#1e3a5f]">
                <th className="text-left text-xs font-medium text-white pb-3 px-4">Name</th>
                <th className="text-left text-xs font-medium text-white pb-3 px-4">Email</th>
                <th className="text-left text-xs font-medium text-white pb-3 px-4">Role</th>
                <th className="text-center text-xs font-medium text-white pb-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-white pb-3 px-4">Last Login</th>
                <th className="text-center text-xs font-medium text-white pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-[#0f172a]">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-[#475569]">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      variant={roleVariantMap[user.role]}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      label={user.isActive ? 'Active' : 'Inactive'}
                      variant={user.isActive ? 'success' : 'default'}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-[#475569]">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-xs text-[#1e3a5f] hover:underline"
                      >
                        Edit
                      </button>
                      {user.isActive && (
                        <button
                          onClick={() => handleDeactivate(user)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        mode={modalMode}
        user={selectedUser}
        token={token}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </>
  );
};