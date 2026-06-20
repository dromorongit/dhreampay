'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface ColumnMapperProps {
  headers: string[]
  onMappingChange: (mapping: Record<string, string>) => void
}

const REQUIRED_FIELDS = [
  { key: 'transactionRef', label: 'Transaction Reference' },
  { key: 'cardNumber', label: 'Card Number' },
  { key: 'cardHolderName', label: 'Card Holder Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'transactionDate', label: 'Transaction Date' },
  { key: 'transactionType', label: 'Transaction Type' },
]

const OPTIONAL_FIELDS = [
  { key: 'currency', label: 'Currency' },
  { key: 'merchantName', label: 'Merchant Name' },
  { key: 'merchantCode', label: 'Merchant Code' },
  { key: 'isVIP', label: 'VIP Flag' },
]

function similarity(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (aLower === bLower) return 1
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8
  return 0
}

export function ColumnMapper({ headers, onMappingChange }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialMapping: Record<string, string> = {}
    const autoMapped = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map(field => {
      let bestMatch = ''
      let bestScore = 0
      for (const header of headers) {
        const score = similarity(field.label, header)
        if (score > bestScore) {
          bestScore = score
          bestMatch = header
        }
      }
      return { key: field.key, value: bestMatch }
    })
    autoMapped.forEach(m => {
      if (m.value) initialMapping[m.key] = m.value
    })
    setMapping(initialMapping)
    onMappingChange(initialMapping)
  }, [headers, onMappingChange])

  const handleMappingChange = (fieldKey: string, value: string) => {
    const newMapping = { ...mapping, [fieldKey]: value }
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  const resetMapping = () => {
    const reset: Record<string, string> = {}
    REQUIRED_FIELDS.forEach(f => { reset[f.key] = '' })
    OPTIONAL_FIELDS.forEach(f => { reset[f.key] = '' })
    setMapping(reset)
    onMappingChange(reset)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dhreampay-text-primary">Column Mapping</h3>
        <button
          onClick={resetMapping}
          className="flex items-center gap-2 px-3 py-1 text-sm text-dhreampay-text-secondary hover:text-dhreampay-text-primary rounded-md hover:bg-dhreampay-border transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3 text-dhreampay-text-primary">Required Fields</h4>
          <div className="space-y-3">
            {REQUIRED_FIELDS.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-dhreampay-text-secondary">{field.label}</label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={e => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 text-dhreampay-text-primary">Optional Fields</h4>
          <div className="space-y-3">
            {OPTIONAL_FIELDS.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-dhreampay-text-secondary">{field.label}</label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={e => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-dhreampay-border rounded-md bg-dhreampay-primary text-dhreampay-text-primary focus:outline-none focus:ring-2 focus:ring-dhreampay-gold"
                >
                  <option value="">Select column (optional)...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-dhreampay-border/20 rounded-lg">
        <p className="text-sm text-dhreampay-text-secondary">
          <span className="font-medium">Auto-mapped columns</span> based on header similarity. Please verify all mappings are correct before proceeding.
        </p>
      </div>
    </div>
  )
}