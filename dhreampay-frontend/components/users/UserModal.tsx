'use client';

import { FC, useState, useEffect, FormEvent } from 'react';
import { createUser, updateUser } from '@/lib/api/users';
import type { User } from '../../types/api';

interface UserModalProps {
  mode: 'create' | 'edit' | null;
  user: User | null;
  token: string;
  onClose: () => void;
  onSaved: (user: User) => void;
}

type FormData = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'reconciler' | 'viewer';
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

const roleOptions: Array<'admin' | 'reconciler' | 'viewer'> = ['admin', 'reconciler', 'viewer'];

export const UserModal: FC<UserModalProps> = ({
  mode,
  user,
  token,
  onClose,
  onSaved,
}) => {
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'reconciler',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    }
  }, [isEditMode, user]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!isEditMode) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      if (isCreateMode) {
        const response = await createUser(token, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        });
        if (response.data) {
          onSaved(response.data);
        }
      } else if (isEditMode && user) {
        const response = await updateUser(token, user._id, {
          name: formData.name.trim(),
          role: formData.role,
        });
        if (response.data) {
          onSaved(response.data);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value as string }));
    const errorField = field as keyof FormErrors;
    if (errors[errorField]) {
      setErrors((prev) => ({ ...prev, [errorField]: undefined }));
    }
  };

  if (!mode) return null;

  const getTitle = (): string => {
    if (isCreateMode) return 'Add User';
    return 'Edit User';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{getTitle()}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
                  Name
                </label>
<input
                   id="name"
                   type="text"
                   value={formData.name}
                   onChange={(e) => handleChange('name', e.target.value)}
                   disabled={loading}
                   placeholder="Enter full name"
                   className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
                 />
                {errors.name && <span className="text-xs text-red-600 mt-1">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                  Email
                </label>
<input
                   id="email"
                   type="email"
                   value={formData.email}
                   onChange={(e) => handleChange('email', e.target.value)}
                   disabled={loading || isEditMode}
                   placeholder="Enter email address"
                   className={`w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white ${
                     isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                   }`}
                 />
                {isEditMode && (
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                )}
                {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email}</span>}
              </div>

              {isCreateMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                    Password
                  </label>
<input
                   id="password"
                   type="password"
                   value={formData.password}
                   onChange={(e) => handleChange('password', e.target.value)}
                   disabled={loading}
                   placeholder="Enter password (min 8 characters)"
                   className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
                 />
                  {errors.password && (
                    <span className="text-xs text-red-600 mt-1">{errors.password}</span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">
                  Role
                </label>
<select
                   id="role"
                   value={formData.role}
                   onChange={(e) =>
                     handleChange('role', e.target.value as 'admin' | 'reconciler' | 'viewer')
                   }
                   disabled={loading}
                   className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
                 >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.role && <span className="text-xs text-red-600 mt-1">{errors.role}</span>}
              </div>

              {submitError && <span className="text-xs text-red-600 block">{submitError}</span>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-[#1e3a5f] text-[#1e3a5f] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-[#1e3a5f] text-white hover:bg-[#2d5a9e] transition-colors disabled:opacity-50"
                >
                  {isCreateMode ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};