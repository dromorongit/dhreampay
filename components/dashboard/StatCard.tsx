'use client'

import { CreditCard, CheckCircle, AlertTriangle, Star, BarChart3 } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: 'CreditCard' | 'CheckCircle' | 'AlertTriangle' | 'Star' | 'BarChart3'
  color?: 'blue' | 'green' | 'red' | 'gold' | 'purple' | 'info'
  percentageChange?: number
  prefix?: string
}

const iconMap = {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
}

const colorClasses = {
  blue: 'bg-dhreampay-info',
  green: 'bg-dhreampay-success',
  red: 'bg-dhreampay-error',
  gold: 'bg-dhreampay-gold',
  purple: 'bg-purple-500',
  info: 'bg-dhreampay-info',
}

export function StatCard({ title, value, icon, color = 'blue', percentageChange, prefix }: StatCardProps) {
  const Icon = iconMap[icon]

  return (
    <div className='bg-dhreampay-card border border-dhreampay-border rounded-lg p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-dhreampay-text-secondary text-sm font-medium'>{title}</p>
          <p className='text-dhreampay-text-primary text-3xl font-bold mt-2'>
            {prefix && <span className='text-lg'>{prefix}</span>}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {percentageChange !== undefined && (
            <p className={'text-sm mt-2 ' + (percentageChange >= 0 ? 'text-dhreampay-success' : 'text-dhreampay-error')}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange}% from last week
            </p>
          )}
        </div>
        <div className={'w-12 h-12 ' + (colorClasses[color] || colorClasses.blue) + ' rounded-lg flex items-center justify-center'}>
          <Icon className='w-6 h-6 text-white' />
        </div>
      </div>
    </div>
  )
}
