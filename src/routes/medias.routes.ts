import { accessTokenSchema, verifiedUserValidator } from './../middlewares/users.middlewares'
import { Router } from 'express'
import {
  updateImageController,
  updateVideoController,
  updateVideoHlsController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenSchema, verifiedUserValidator, wrapRequestHandler(updateImageController))

mediasRouter.post('/upload-video', accessTokenSchema, verifiedUserValidator, wrapRequestHandler(updateVideoController))

mediasRouter.post(
  '/upload-video-hls',
  accessTokenSchema,
  verifiedUserValidator,
  wrapRequestHandler(updateVideoHlsController)
)

mediasRouter.get(
  '/video-status/:id',
  accessTokenSchema,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediasRouter
