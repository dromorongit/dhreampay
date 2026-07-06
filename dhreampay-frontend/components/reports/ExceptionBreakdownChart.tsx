'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ExceptionBreakdownChartProps {
  breakdown: Record<string, number>;
}

function formatExceptionType(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ExceptionBreakdownChart({ breakdown }: ExceptionBreakdownChartProps) {
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    return null;
  }

  const chartData = Object.entries(breakdown)
    .map(([type, count]) => ({
      type,
      label: formatExceptionType(type),
      count,
    }))
    .filter((item) => item.count > 0);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-sm">
      <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Exception Breakdown</h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fontSize: 12 }}
              width={120}
            />
<Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value: number | undefined) => [`${value ?? 0} records`, 'Count']}
            />
            <Bar dataKey="count" fill="#d4a017" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}