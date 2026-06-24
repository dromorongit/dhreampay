import * as XLSX from 'xlsx'
import { RawRow, SupportedFileType } from '../../types/ingestion.types.js'

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, '_')
}

function parseFile(buffer: Buffer, fileType: SupportedFileType): RawRow[] {
  if (buffer.length === 0) {
    throw new Error('File is empty')
  }

  let workbook: XLSX.WorkBook
  if (fileType === 'xlsx') {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  } else {
    const content = buffer.toString('utf-8')
    workbook = XLSX.read(content, { type: 'string', cellDates: true })
  }

  const sheetName = workbook.SheetNames[0]
  if (sheetName === undefined) {
    throw new Error('No sheets found in file')
  }

  const sheet = workbook.Sheets[sheetName]
  if (sheet === undefined) {
    throw new Error('Sheet not found')
  }

  const rawData: RawRow[] = XLSX.utils.sheet_to_json(sheet)

  if (rawData.length === 0) {
    throw new Error('No rows found in file')
  }

  const normalizedRows: RawRow[] = rawData.map((row) => {
    const normalizedRow: RawRow = {}
    for (const key of Object.keys(row)) {
      const normalizedKey = normalizeHeader(key)
      normalizedRow[normalizedKey] = row[key]
    }
    return normalizedRow
  })

  return normalizedRows
}

export { parseFile }