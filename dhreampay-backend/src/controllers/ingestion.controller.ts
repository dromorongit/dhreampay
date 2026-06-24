import { Request, Response } from 'express'
import { ingestFile } from '../services/ingestion/batchIngestion.service.js'
import { FileSource, SupportedFileType } from '../types/ingestion.types.js'

function getFileTypeFromFilename(filename: string): SupportedFileType | null {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.csv')) {
    return 'csv'
  }
  if (lower.endsWith('.xlsx')) {
    return 'xlsx'
  }
  return null
}

async function uploadFile(req: Request, res: Response): Promise<Response> {
  if (req.file === undefined) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    })
  }

  const source = req.body.source
  if (source === undefined || source === null) {
    return res.status(400).json({
      success: false,
      message: 'source is required in request body'
    })
  }

  const sourceValue: FileSource = source

  const fileType = getFileTypeFromFilename(req.file.originalname)
  if (fileType === null) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only .csv and .xlsx files are supported'
    })
  }

  const uploadedBy = req.user?.userId ?? 'unknown'

  try {
    const result = await ingestFile(
      req.file.buffer,
      fileType,
      sourceValue,
      req.file.originalname,
      uploadedBy
    )

    return res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process file'
    })
  }
}

export { uploadFile }