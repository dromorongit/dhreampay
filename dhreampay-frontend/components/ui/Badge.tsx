import type { FC } from 'react';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default' | 'gold';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-600',
  gold: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export const Badge: FC<BadgeProps> = ({ label, variant = 'default' }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${variantClasses[variant]}`}>
      {label}
    </span>
  );
};