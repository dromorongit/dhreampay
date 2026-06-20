'use client'

interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  
  const variantClasses = {
    default: 'bg-dhreampay-gold text-dhreampay-primary',
    outline: 'border border-dhreampay-border text-dhreampay-text-primary',
    secondary: 'bg-dhreampay-border text-dhreampay-text-secondary',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}