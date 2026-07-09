import { Router } from 'express'
import { loginHandler, refreshHandler, meHandler, bootstrapRegisterHandler, bootstrapStatusHandler } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { bootstrapRegisterSchema } from '../validators/auth.validator.js'

const authRouter = Router()

authRouter.post('/login', loginHandler)
authRouter.post('/refresh', refreshHandler)
authRouter.get('/me', authMiddleware, meHandler)
authRouter.get('/bootstrap-status', bootstrapStatusHandler)
authRouter.post('/bootstrap-register', validate(bootstrapRegisterSchema, 'body'), bootstrapRegisterHandler)

export { authRouter }