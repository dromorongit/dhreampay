export enum Role {
  ADMIN = 'ADMIN',
  RECONCILIATION_OFFICER = 'RECONCILIATION_OFFICER',
  VIP_DESK = 'VIP_DESK',
  AUDITOR = 'AUDITOR',
}

export const APP_NAME = 'DhreamPay'
export const APP_DESCRIPTION = 'Visa Card and VIP Transaction Reconciliation and Settlement System'

export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  reconciliation: '/reconciliation',
  vipTransactions: '/vip-transactions',
  admin: '/admin',
  auditor: '/auditor',
} as const