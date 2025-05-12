import { accessTokenSchema, verifiedUserValidator } from './../middlewares/users.middlewares'
import { Router } from 'express'
import { updateImageController, updateVideoController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenSchema, verifiedUserValidator, wrapRequestHandler(updateImageController))

mediasRouter.post('/upload-video', wrapRequestHandler(updateVideoController))

export default mediasRouter
