'use client'

import { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { FileText } from 'lucide-react'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  onError?: (error: string) => void
}

export function FileDropzone({ onFileSelect, onError }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    const allowedExtensions = ['.csv', '.xlsx', '.xls']
    const maxSize = 10 * 1024 * 1024

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
      onError?.('Invalid file type. Please upload CSV or Excel files only.')
      return false
    }

    if (file.size > maxSize) {
      onError?.('File size exceeds 10MB limit.')
      return false
    }

    return true
  }

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect, onError])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    onFileSelect(null as any)
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive ? 'border-dhreampay-gold bg-dhreampay-border/20' : 'border-dhreampay-border hover:border-dhreampay-gold'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-4 text-dhreampay-text-secondary" />
            <p className="mb-2 text-sm text-dhreampay-text-secondary">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-dhreampay-text-secondary">CSV or Excel files (max 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 border border-dhreampay-border rounded-lg bg-dhreampay-primary">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-dhreampay-gold" />
            <div>
              <p className="font-medium text-dhreampay-text-primary">{selectedFile.name}</p>
              <p className="text-sm text-dhreampay-text-secondary">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 text-dhreampay-text-secondary hover:text-red-500 rounded-md hover:bg-dhreampay-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}