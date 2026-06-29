import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accentColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#1e3a5f',
}: StatsCardProps) {
  return (
    <div className="bg-[#f8fafc] rounded-xl p-6 relative border border-[#e2e8f0]">
      <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#475569]">{title}</p>
        <p className="text-3xl font-bold text-[#0f172a]">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-xs text-[#475569]">{subtitle}</p>}
      </div>
    </div>
  );
}