import { z } from 'zod'
import { RawRow, ParsedRow, FileSource } from '../../types/ingestion.types.js'

const transactionTypeSchema = z.enum(['purchase', 'refund', 'reversal', 'adjustment'])

const parsedRowSchema = z.object({
  transactionId: z.string().min(1, 'transaction_id is required'),
  cardNumberMasked: z.string().min(1, 'card_number is required'),
  amount: z.number({ required_error: 'amount is required' }).positive('amount must be positive'),
  currency: z.string().default('GHS'),
  transactionDate: z.date({ required_error: 'transaction_date is required' }),
  postingDate: z.date({ required_error: 'posting_date is required' }),
  merchantId: z.string().min(1, 'merchant_id is required'),
  terminalId: z.string().optional(),
  authorizationCode: z.string().optional(),
  transactionType: transactionTypeSchema,
  isVIP: z.boolean().default(false)
})

function parseDate(value: unknown): Date | null {
  if (value === undefined || value === null) {
    return null
  }
  const dateStr = String(value)
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null) {
    return null
  }
  const num = Number(value)
  return isNaN(num) ? null : num
}

function parseBoolean(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true' || value.toLowerCase() === '1' || value.toLowerCase() === 'yes') {
      return true
    }
    if (value.toLowerCase() === 'false' || value.toLowerCase() === '0' || value.toLowerCase() === 'no') {
      return false
    }
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return false
}

function validateAndMapRow(raw: RawRow, source: FileSource): { success: true; data: ParsedRow } | { success: false; error: string } {
  const transactionIdRaw = raw.transaction_id
  const cardNumberMaskedRaw = raw.card_number
  const amountRaw = raw.amount
  const currencyRaw = raw.currency
  const transactionDateRaw = raw.transaction_date
  const postingDateRaw = raw.posting_date
  const merchantIdRaw = raw.merchant_id
  const terminalIdRaw = raw.terminal_id
  const authorizationCodeRaw = raw.auth_code
  const transactionTypeRaw = raw.transaction_type
  const isVIPRaw = raw.is_vip

  if (transactionIdRaw === undefined || transactionIdRaw === null) {
    return { success: false, error: 'Missing required field: transaction_id' }
  }

  if (cardNumberMaskedRaw === undefined || cardNumberMaskedRaw === null) {
    return { success: false, error: 'Missing required field: card_number' }
  }

  if (amountRaw === undefined || amountRaw === null) {
    return { success: false, error: 'Missing required field: amount' }
  }

  if (merchantIdRaw === undefined || merchantIdRaw === null) {
    return { success: false, error: 'Missing required field: merchant_id' }
  }

  if (transactionTypeRaw === undefined || transactionTypeRaw === null) {
    return { success: false, error: 'Missing required field: transaction_type' }
  }

  const parsedAmount = parseNumber(amountRaw)
  if (parsedAmount === null) {
    return { success: false, error: 'Invalid amount value' }
  }

  const parsedTransactionDate = parseDate(transactionDateRaw)
  if (parsedTransactionDate === null) {
    return { success: false, error: 'Invalid transaction_date value' }
  }

  const parsedPostingDate = parseDate(postingDateRaw)
  if (parsedPostingDate === null) {
    return { success: false, error: 'Invalid posting_date value' }
  }

  const transactionTypeResult = transactionTypeSchema.safeParse(transactionTypeRaw)
  if (transactionTypeResult.success === false) {
    return { success: false, error: 'Invalid transaction_type value' }
  }

  const normalizedRow: ParsedRow = {
    transactionId: String(transactionIdRaw),
    cardNumberMasked: String(cardNumberMaskedRaw),
    amount: parsedAmount,
    currency: currencyRaw !== undefined && currencyRaw !== null ? String(currencyRaw) : 'GHS',
    transactionDate: parsedTransactionDate,
    postingDate: parsedPostingDate,
    merchantId: String(merchantIdRaw),
    terminalId: terminalIdRaw !== undefined && terminalIdRaw !== null ? String(terminalIdRaw) : undefined,
    authorizationCode: authorizationCodeRaw !== undefined && authorizationCodeRaw !== null ? String(authorizationCodeRaw) : undefined,
    transactionType: transactionTypeResult.data,
    isVIP: parseBoolean(isVIPRaw)
  }

  const validationResult = parsedRowSchema.safeParse(normalizedRow)
  if (validationResult.success === false) {
    const firstError = validationResult.error.errors[0]
    return { success: false, error: firstError.message }
  }

  return { success: true, data: normalizedRow }
}

export { validateAndMapRow }