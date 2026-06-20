'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  BANK: number
  VISA: number
}

interface TransactionChartProps {
  data: ChartData[]
}

export function TransactionChart({ data }: TransactionChartProps) {
  return (
    <div className='bg-dhreampay-card border border-dhreampay-border rounded-lg p-6'>
      <h3 className='text-dhreampay-text-primary text-lg font-semibold mb-4'>Transaction Volume (Last 7 Days)</h3>
      {!data || data.length === 0 ? (
        <div className='flex items-center justify-center h-64'>
          <p className='text-dhreampay-text-secondary'>No transaction data available</p>
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='date' stroke='#94A3B8' />
            <YAxis stroke='#94A3B8' />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Legend wrapperStyle={{ color: '#94A3B8' }} />
            <Bar dataKey='BANK' fill='#3B82F6' name='Bank Transactions' />
            <Bar dataKey='VISA' fill='#F59E0B' name='Visa Transactions' />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}