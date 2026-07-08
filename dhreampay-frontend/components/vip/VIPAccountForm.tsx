'use client';

import { FC, useState, useEffect, FormEvent } from 'react';
import type { VIPAccount, CreateVIPAccountDTO, UpdateVIPAccountDTO } from '../../types/api';

interface VIPAccountFormProps {
  initialData: VIPAccount | null;
  onSubmit: (data: CreateVIPAccountDTO | UpdateVIPAccountDTO) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitError?: string | null;
}

type FormData = {
  accountId: string;
  cardNumberMasked: string;
  customerName: string;
  vipTier: 'platinum' | 'gold' | 'silver';
  accountManager: string;
  notes: string;
  isActive: boolean;
};

type FormErrors = {
  accountId?: string;
  cardNumberMasked?: string;
  customerName?: string;
  vipTier?: string;
};

export const VIPAccountForm: FC<VIPAccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitError,
}) => {
  const isEditMode = initialData !== null;

  const [formData, setFormData] = useState<FormData>({
    accountId: '',
    cardNumberMasked: '',
    customerName: '',
    vipTier: 'gold',
    accountManager: '',
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        accountId: initialData.accountId,
        cardNumberMasked: initialData.cardNumberMasked,
        customerName: initialData.customerName,
        vipTier: initialData.vipTier,
        accountManager: initialData.accountManager ?? '',
        notes: initialData.notes ?? '',
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.accountId.trim()) {
      newErrors.accountId = 'Account ID is required';
    }
    if (!formData.cardNumberMasked.trim()) {
      newErrors.cardNumberMasked = 'Card number is required';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.vipTier) {
      newErrors.vipTier = 'VIP tier is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CreateVIPAccountDTO | UpdateVIPAccountDTO = {
      cardNumberMasked: formData.cardNumberMasked.trim(),
      customerName: formData.customerName.trim(),
      vipTier: formData.vipTier,
      accountManager: formData.accountManager.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isActive: formData.isActive,
    };

    if (!isEditMode) {
      (submitData as CreateVIPAccountDTO).accountId = formData.accountId.trim();
    }

    await onSubmit(submitData);
  };

  const handleChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorField = field as keyof FormErrors;
    if (errors[errorField]) {
      setErrors((prev) => ({ ...prev, [errorField]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="account-id">
          Account ID
        </label>
<input
           id="account-id"
           type="text"
           value={formData.accountId}
           onChange={(e) => handleChange('accountId', e.target.value)}
           disabled={isEditMode || loading}
           placeholder="Enter account ID"
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
         />
        {errors.accountId && <span className="text-xs text-red-600 mt-1">{errors.accountId}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="card-number">
          Card Number (Masked)
        </label>
<input
           id="card-number"
           type="text"
           value={formData.cardNumberMasked}
           onChange={(e) => handleChange('cardNumberMasked', e.target.value)}
           disabled={loading}
           placeholder="4532XXXXXXXX1234"
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
         />
        {errors.cardNumberMasked && (
          <span className="text-xs text-red-600 mt-1">{errors.cardNumberMasked}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="customer-name">
          Customer Name
        </label>
<input
           id="customer-name"
           type="text"
           value={formData.customerName}
           onChange={(e) => handleChange('customerName', e.target.value)}
           disabled={loading}
           placeholder="Enter customer name"
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
         />
        {errors.customerName && (
          <span className="text-xs text-red-600 mt-1">{errors.customerName}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="vip-tier">
          VIP Tier
        </label>
<select
           id="vip-tier"
           value={formData.vipTier}
           onChange={(e) =>
             handleChange('vipTier', e.target.value as 'platinum' | 'gold' | 'silver')
           }
           disabled={loading}
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
         >
          <option value="platinum">Platinum</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
        </select>
        {errors.vipTier && <span className="text-xs text-red-600 mt-1">{errors.vipTier}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="account-manager">
          Account Manager (Optional)
        </label>
<input
           id="account-manager"
           type="text"
           value={formData.accountManager}
           onChange={(e) => handleChange('accountManager', e.target.value)}
           disabled={loading}
           placeholder="Enter account manager name"
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
         />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="notes">
          Notes (Optional)
        </label>
<textarea
           id="notes"
           value={formData.notes}
           onChange={(e) => handleChange('notes', e.target.value)}
           disabled={loading}
           placeholder="Add notes..."
           rows={3}
           className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white resize-none"
         />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is-active"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => handleChange('isActive', e.target.checked)}
          disabled={loading}
          className="w-4 h-4 text-[#1e3a5f] border-[#e2e8f0] rounded focus:ring-2 focus:ring-[#1e3a5f]"
        />
        <label className="text-sm font-medium text-slate-700" htmlFor="is-active">
          Is Active
        </label>
      </div>

      {submitError && <span className="text-xs text-red-600 block">{submitError}</span>}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
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
          {isEditMode ? 'Save Changes' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};