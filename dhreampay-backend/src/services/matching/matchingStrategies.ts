import { ITransaction } from '../../types/transaction.types.js'

function calculateAmountDifference(bank: ITransaction, visa: ITransaction): number {
  return Math.abs(bank.amount - visa.amount)
}

function datesWithinWindow(date1: Date, date2: Date, windowDays: number): boolean {
  const diffTime = Math.abs(date1.getTime() - date2.getTime())
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= windowDays
}

function exactMatch(
  bank: ITransaction,
  visa: ITransaction,
  amountTolerance: number,
  dateWindowDays: number
): boolean {
  const transactionIdMatches = bank.transactionId === visa.transactionId
  if (!transactionIdMatches) {
    return false
  }

  const amountDiff = calculateAmountDifference(bank, visa)
  const amountWithinTolerance = amountDiff <= amountTolerance

  const dateWithinWindow = datesWithinWindow(
    bank.transactionDate,
    visa.transactionDate,
    dateWindowDays
  )

  return amountWithinTolerance && dateWithinWindow
}

function fuzzyMatch(
  bank: ITransaction,
  visa: ITransaction,
  amountTolerance: number,
  dateWindowDays: number
): boolean {
  if (bank.authorizationCode !== undefined && bank.authorizationCode !== null &&
      visa.authorizationCode !== undefined && visa.authorizationCode !== null) {
    if (bank.authorizationCode === visa.authorizationCode) {
      return true
    }
  }

  if (bank.merchantId === visa.merchantId) {
    const amountDiff = calculateAmountDifference(bank, visa)
    const amountWithinTolerance = amountDiff <= amountTolerance

    const dateWithinWindow = datesWithinWindow(
      bank.transactionDate,
      visa.transactionDate,
      dateWindowDays
    )

    if (amountWithinTolerance && dateWithinWindow) {
      return true
    }
  }

  return false
}

export {
  calculateAmountDifference,
  exactMatch,
  fuzzyMatch,
  datesWithinWindow
}