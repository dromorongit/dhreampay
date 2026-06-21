'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FileDropzone } from '@/components/transactions/FileDropzone'
import { ColumnMapper } from '@/components/transactions/ColumnMapper'
import { UploadPreview } from '@/components/transactions/UploadPreview'
import { UploadSummary } from '@/components/transactions/UploadSummary'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { Pagination } from '@/components/transactions/Pagination'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/constants'
import * as Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'

export const dynamic = 'force-dynamic'

type Step = 'file' | 'source-type' | 'mapping' | 'preview' | 'import' | 'complete'
type Source = 'BANK' | 'VISA'
type VIPType = 'regular' | 'vip' | 'mixed'

interface TransactionRow {
  transactionRef: string
  cardNumber: string
  cardHolderName: string
  amount: number
  currency: string
  transactionDate: string
  merchantName?: string
  merchantCode?: string
  transactionType: string
  isVIP?: boolean
  errors?: string[]
}

export default function TransactionsPage() {
  const { user } = useAuth()
  const userRole = user?.role as Role | undefined
  const [activeTab, setActiveTab] = useState<'all' | 'upload'>('all')

  // Upload flow state
  const [step, setStep] = useState<Step>('file')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [previewRows, setPreviewRows] = useState<TransactionRow[]>([])
  const [importResults, setImportResults] = useState<{
    imported: number
    skipped: number
    duplicates: number
    errors: string[]
  } | null>(null)

  // Source & type selection
  const [source, setSource] = useState<Source>('BANK')
  const [vipType, setVIPType] = useState<VIPType>('regular')

  // List view state
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    status: '',
    isVIP: '',
    dateFrom: '',
    dateTo: '',
  })
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  const canUpload = userRole === 'ADMIN' || userRole === 'RECONCILIATION_OFFICER'
  const canDelete = userRole === 'ADMIN'

  // Fetch transactions for list view
  useEffect(() => {
    if (activeTab === 'all') {
      fetchTransactions()
    }
  }, [activeTab, page, limit, filters])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      })
      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      if (res.ok) {
        setTransactions(data.transactions)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file)
    
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    let fileHeaders: string[] = []
    let fileRows: any[] = []

    if (ext === '.csv') {
      const csvText = await file.text()
      const results = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
      })
      fileHeaders = results.meta.fields || []
      fileRows = results.data as any[]
    } else if (ext === '.xlsx' || ext === '.xls') {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { cellDates: true })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
      if (jsonData.length > 0) {
        fileHeaders = Object.keys(jsonData[0])
      }
      fileRows = jsonData
    }

    setHeaders(fileHeaders)
    setParsedRows(fileRows)
    setStep('source-type')
  }

  const handleMappingChange = (mapping: Record<string, string>) => {
    setMapping(mapping)
  }

  const applyMapping = () => {
    const requiredFields = ['transactionRef', 'cardNumber', 'cardHolderName', 'amount', 'transactionDate', 'transactionType']
    const hasAllRequired = requiredFields.every(f => mapping[f])

    if (!hasAllRequired) {
      toast.error('Please map all required fields')
      return
    }

    const rows: TransactionRow[] = parsedRows.map((row, idx) => {
      const errors: string[] = []

      // transactionRef
      const txRef = row[mapping.transactionRef]
      if (!txRef || String(txRef).trim() === '') {
        errors.push('transactionRef is required')
      }

      // cardNumber
      const cardNum = row[mapping.cardNumber]
      const cardDigits = String(cardNum || '').replace(/\D/g, '')
      if (!cardNum || cardDigits.length < 12) {
        errors.push('cardNumber must be at least 12 digits')
      }

      // cardHolderName
      const holder = row[mapping.cardHolderName]
      if (!holder || String(holder).trim() === '') {
        errors.push('cardHolderName is required')
      }

      // amount
      const amt = row[mapping.amount]
      const parsedAmt = typeof amt === 'number' ? amt : parseFloat(String(amt || '').replace(/[$,]/g, ''))
      if (isNaN(parsedAmt) || parsedAmt < 0) {
        errors.push('amount must be a valid positive number')
      }

      // transactionDate
      const txDate = row[mapping.transactionDate]
      const parsedDate = txDate ? new Date(txDate) : null
      if (!txDate || isNaN(parsedDate?.getTime() || 0)) {
        errors.push('transactionDate must be a valid date')
      } else if (parsedDate) {
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (parsedDate > today) {
          errors.push('transactionDate cannot be a future date')
        }
      }

      // transactionType
      const txType = String(row[mapping.transactionType] || '').toUpperCase().trim()
      const validTypes = ['PURCHASE', 'REFUND', 'REVERSAL', 'CHARGEBACK', 'FEE', 'SETTLEMENT']
      const mappedType = validTypes.includes(txType) ? txType : null
      if (!mappedType) {
        errors.push('transactionType must be valid')
      }

      return {
        transactionRef: txRef || '',
        cardNumber: cardNum || '',
        cardHolderName: holder || '',
        amount: isNaN(parsedAmt) ? 0 : parsedAmt,
        currency: (row[mapping.currency] as string) || 'USD',
        transactionDate: parsedDate?.toISOString().split('T')[0] || '',
        merchantName: row[mapping.merchantName] || undefined,
        merchantCode: row[mapping.merchantCode] || undefined,
        transactionType: mappedType || '',
        isVIP: vipType === 'vip' ? true : vipType === 'mixed' ? Boolean(row[mapping.isVIP]) : false,
        errors: errors.length > 0 ? errors : undefined,
      }
    })

    setPreviewRows(rows)
    setStep('preview')
  }

  const generateBatchId = () => {
    return `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const handleImport = async () => {
    const validRows = previewRows.filter(r => !r.errors?.length)
    const batchId = generateBatchId()

    setStep('import')
    
    const toastId = toast.loading('Importing transactions...')

    try {
      const res = await fetch('/api/transactions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: validRows,
          source,
          batchId,
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setImportResults({
          imported: data.importedCount,
          skipped: data.skippedCount,
          duplicates: data.duplicateCount,
          errors: data.errors,
        })
        setStep('complete')
        toast.success(`Imported ${data.importedCount} transactions`, { id: toastId })
      } else {
        toast.error(data.error || 'Import failed', { id: toastId })
        setStep('preview')
      }
    } catch (error) {
      toast.error('Import failed', { id: toastId })
      setStep('preview')
    }
  }

  const resetUpload = () => {
    setStep('file')
    setUploadedFile(null)
    setHeaders([])
    setMapping({})
    setParsedRows([])
    setPreviewRows([])
    setImportResults(null)
    setSource('BANK')
    setVIPType('regular')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Transaction deleted')
        fetchTransactions()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dhreampay-text-primary">Transactions</h1>
          <p className="text-dhreampay-text-secondary">Manage and view transaction records</p>
        </div>

        <div className="border-b border-dhreampay-border">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-dhreampay-gold border-b-2 border-dhreampay-gold'
                  : 'text-dhreampay-text-secondary hover:text-dhreampay-text-primary'
              }`}
            >
              All Transactions
            </button>
            {canUpload && (
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-dhreampay-gold border-b-2 border-dhreampay-gold'
                    : 'text-dhreampay-text-secondary hover:text-dhreampay-text-primary'
                }`}
              >
                Upload New
              </button>
            )}
          </nav>
        </div>

        {activeTab === 'all' && (
          <div className="space-y-4">
            <TransactionFilters
              {...filters}
              onSearchChange={v => setFilters(f => ({ ...f, search: v }))}
              onSourceChange={v => setFilters(f => ({ ...f, source: v }))}
              onStatusChange={v => setFilters(f => ({ ...f, status: v }))}
              onVIPChange={v => setFilters(f => ({ ...f, isVIP: v }))}
              onDateFromChange={v => setFilters(f => ({ ...f, dateFrom: v }))}
              onDateToChange={v => setFilters(f => ({ ...f, dateTo: v }))}
              userRole={userRole}
            />

            <TransactionTable
              transactions={transactions}
              loading={loading}
              onView={setSelectedTransaction}
              onDelete={handleDelete}
              canDelete={canDelete}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={v => {
                setLimit(v)
                setPage(1)
              }}
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {step === 'file' && (
              <FileDropzone onFileSelect={handleFileSelect} />
            )}

            {step === 'source-type' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-dhreampay-text-primary">Source & Type Selection</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-dhreampay-text-secondary">Transaction Source</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={source === 'BANK'}
                          onChange={() => setSource('BANK')}
                          className="w-4 h-4 text-dhreampay-gold"
                        />
                        <span className="text-dhreampay-text-primary">Bank</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={source === 'VISA'}
                          onChange={() => setSource('VISA')}
                          className="w-4 h-4 text-dhreampay-gold"
                        />
                        <span className="text-dhreampay-text-primary">Visa</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 text-dhreampay-text-secondary">VIP Type</p>
                    <select
                      value={vipType}
                      onChange={e => setVIPType(e.target.value as VIPType)}
                      className="w-full md:w-64 px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary"
                    >
                      <option value="regular">Regular Only</option>
                      <option value="vip">VIP Only</option>
                      <option value="mixed">Mixed — detect from data</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('file')}
                    className="px-4 py-2 border border-dhreampay-border rounded-md text-dhreampay-text-primary hover:bg-dhreampay-border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('mapping')}
                    className="px-4 py-2 bg-dhreampay-gold text-dhreampay-primary rounded-md hover:bg-dhreampay-gold/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'mapping' && (
              <div className="space-y-4">
                <ColumnMapper headers={headers} onMappingChange={handleMappingChange} />
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('source-type')}
                    className="px-4 py-2 border border-dhreampay-border rounded-md text-dhreampay-text-primary hover:bg-dhreampay-border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={applyMapping}
                    className="px-4 py-2 bg-dhreampay-gold text-dhreampay-primary rounded-md hover:bg-dhreampay-gold/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <UploadPreview rows={previewRows} mapping={mapping} />
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('mapping')}
                    className="px-4 py-2 border border-dhreampay-border rounded-md text-dhreampay-text-primary hover:bg-dhreampay-border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 bg-dhreampay-gold text-dhreampay-primary rounded-md hover:bg-dhreampay-gold/90 transition-colors"
                  >
                    Import {previewRows.filter(r => !r.errors?.length).length} Transactions
                  </button>
                </div>
              </div>
            )}

            {step === 'import' && (
              <div className="flex items-center justify-center p-12">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-dhreampay-gold border-t-transparent"></div>
                  <span className="text-dhreampay-text-primary">Importing transactions...</span>
                </div>
              </div>
            )}

            {step === 'complete' && importResults && (
              <div className="space-y-6">
                <UploadSummary
                  importedCount={importResults.imported}
                  skippedCount={importResults.skipped}
                  duplicateCount={importResults.duplicates}
                  errorCount={importResults.errors.length}
                />
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 bg-dhreampay-gold text-dhreampay-primary rounded-md hover:bg-dhreampay-gold/90 transition-colors"
                >
                  Upload Another Batch
                </button>
              </div>
            )}
          </div>
        )}

        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    </DashboardLayout>
  )
}