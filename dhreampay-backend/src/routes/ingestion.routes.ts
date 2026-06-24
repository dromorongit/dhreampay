import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { uploadQuerySchema } from '../validators/ingestion.validator.js'
import { uploadFile } from '../controllers/ingestion.controller.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

function fileTypeFilter(req: Request, res: Response, next: NextFunction) {
  if (req.file === undefined) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    })
  }

  const allowedExtensions = ['.csv', '.xlsx']
  const originalname = req.file.originalname.toLowerCase()
  const hasValidExtension = allowedExtensions.some((ext) => originalname.endsWith(ext))

  if (hasValidExtension === false) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only .csv and .xlsx files are supported'
    })
  }

  next()
}

const ingestionRouter = Router()

ingestionRouter.post(
  '/upload',
  authMiddleware,
  authorize('admin', 'reconciler'),
  upload.single('file'),
  fileTypeFilter,
  validate(uploadQuerySchema, 'body'),
  uploadFile
)

export { ingestionRouter }