export type FileSource = 'bank' | 'visa'

export type SupportedFileType = 'csv' | 'xlsx'

export type RawRow = Record<string, unknown>

export interface ParsedRow {
  transactionId: string
  cardNumberMasked: string
  amount: number
  currency: string
  transactionDate: Date
  postingDate: Date
  merchantId: string
  terminalId?: string
  authorizationCode?: string
  transactionType: 'purchase' | 'refund' | 'reversal' | 'adjustment'
  isVIP: boolean
}

export interface IngestionError {
  row: number
  message: string
}

export interface IngestionResult {
  batchId: string
  totalRows: number
  successCount: number
  errorCount: number
  errors: IngestionError[]
}