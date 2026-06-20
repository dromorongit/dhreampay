import { connectDB } from '@/lib/mongodb/client'
import { Transaction, AuditLog } from '@/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import mongoose from 'mongoose'

function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.length < 8) {
    return cleaned.slice(-4).padStart(4, '*')
  }
  const first4 = cleaned.slice(0, 4)
  const last4 = cleaned.slice(-4)
  const middleLength = cleaned.length - 8
  const masked = '*'.repeat(Math.max(0, middleLength))
  return `${first4}${masked}${last4}`
}

function parseAmount(amount: any): number | null {
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[$,]/g, ''))
    return isNaN(parsed) ? null : parsed
  }
  return null
}

function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return null
  return parsed
}

function normalizeTransactionType(type: string): string | null {
  const normalized = type?.toUpperCase().trim()
  const validTypes = ['PURCHASE', 'REFUND', 'REVERSAL', 'CHARGEBACK', 'FEE', 'SETTLEMENT']
  // Handle common variations
  if (normalized === 'PURCHASE' || normalized === 'AUTH' || normalized === 'SALE') return 'PURCHASE'
  if (normalized === 'REFUND' || normalized === 'CREDIT') return 'REFUND'
  if (normalized === 'REVERSAL' || normalized === 'VOID') return 'REVERSAL'
  if (normalized === 'CHARGEBACK' || normalized === 'CB') return 'CHARGEBACK'
  if (normalized === 'FEE' || normalized === 'CHARGEBACK_FEE') return 'FEE'
  if (normalized === 'SETTLEMENT' || normalized === 'SETTLE') return 'SETTLEMENT'
  return validTypes.includes(normalized) ? normalized : null
}

async function checkTransactionRefExists(transactionRef: string) {
  return await Transaction.findOne({ transactionRef }).select('_id').lean()
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'RECONCILIATION_OFFICER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const body = await request.json()
  const { transactions, source, batchId } = body

  if (!transactions || !Array.isArray(transactions) || !source || !batchId) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const validSources = ['BANK', 'VISA']
  if (!validSources.includes(source)) {
    return Response.json({ error: 'Invalid source' }, { status: 400 })
  }

  const errors: string[] = []
  const validTransactions: any[] = []
  const duplicateRefs: string[] = []
  const seenRefs = new Set<string>()

  for (let i = 0; i < transactions.length; i++) {
    const row = transactions[i]
    const rowErrors: string[] = []

    // Validate transactionRef
    if (!row.transactionRef || typeof row.transactionRef !== 'string' || row.transactionRef.trim() === '') {
      rowErrors.push('transactionRef is required')
    } else if (seenRefs.has(row.transactionRef)) {
      duplicateRefs.push(row.transactionRef)
      continue
    } else {
      seenRefs.add(row.transactionRef)
    }

    // Validate cardNumber
    if (!row.cardNumber || typeof row.cardNumber !== 'string' || row.cardNumber.replace(/\D/g, '').length < 12) {
      rowErrors.push('cardNumber must be at least 12 digits')
    }

    // Validate cardHolderName
    if (!row.cardHolderName || typeof row.cardHolderName !== 'string' || row.cardHolderName.trim() === '') {
      rowErrors.push('cardHolderName is required')
    }

    // Validate amount
    const amount = parseAmount(row.amount)
    if (amount === null || amount < 0) {
      rowErrors.push('amount must be a valid positive number')
    }

    // Validate transactionDate
    const transactionDate = parseDate(row.transactionDate)
    if (!transactionDate) {
      rowErrors.push('transactionDate must be a valid date')
    } else {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (transactionDate > today) {
        rowErrors.push('transactionDate cannot be a future date')
      }
    }

    // Validate transactionType
    const transactionType = normalizeTransactionType(row.transactionType)
    if (!transactionType) {
      rowErrors.push('transactionType must be one of: PURCHASE, REFUND, REVERSAL, CHARGEBACK, FEE, SETTLEMENT')
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`)
      continue
    }

    // Check for duplicates in database
    const existing = await checkTransactionRefExists(row.transactionRef)
    if (existing) {
      duplicateRefs.push(row.transactionRef)
      continue
    }

    validTransactions.push({
      transactionRef: row.transactionRef.trim(),
      cardNumber: maskCardNumber(row.cardNumber),
      cardHolderName: row.cardHolderName.trim(),
      amount,
      currency: row.currency?.trim() || 'USD',
      transactionDate,
      merchantName: row.merchantName?.trim(),
      merchantCode: row.merchantCode?.trim(),
      transactionType,
      source,
      isVIP: row.isVIP || false,
      batchId,
    })
  }

  let importedCount = 0
  let skippedCount = 0

  if (validTransactions.length > 0) {
    try {
      const result = await Transaction.insertMany(validTransactions, { ordered: false })
      importedCount = result.length
    } catch (err: any) {
      // Count successful inserts from errors
      if (err?.writeErrors) {
        importedCount = validTransactions.length - err.writeErrors.length
        for (const writeError of err.writeErrors) {
          if (writeError.code === 11000) {
            importedCount = Math.max(0, importedCount - 1)
            skippedCount++
          }
        }
      }
    }
  }

  skippedCount += errors.length + duplicateRefs.length

  // Create audit log
  await AuditLog.create({
    userId: new mongoose.Types.ObjectId((session.user as any).id),
    action: 'UPLOADED_TRANSACTIONS',
    entity: 'Transaction',
    entityId: batchId,
    details: `Imported ${importedCount} transactions, skipped ${errors.length + duplicateRefs.length}`,
  })

  return Response.json({
    importedCount,
    skippedCount,
    duplicateCount: duplicateRefs.length,
    errors,
  })
}