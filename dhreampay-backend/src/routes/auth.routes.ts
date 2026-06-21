import { Router } from 'express'
import { loginHandler, refreshHandler, meHandler } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const authRouter = Router()

authRouter.post('/login', loginHandler)
authRouter.post('/refresh', refreshHandler)
authRouter.get('/me', authMiddleware, meHandler)

export { authRouter }