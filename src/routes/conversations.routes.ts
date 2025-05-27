import { Router } from 'express'
import { conversationController } from '~/controllers/conversations.controllers'
import { accessTokenSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationRouter = Router()

conversationRouter.get('/', accessTokenSchema, verifiedUserValidator, wrapRequestHandler(conversationController))

export default conversationRouter
