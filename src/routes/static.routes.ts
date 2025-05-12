import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/resource/image/:name', serveImageController)
staticRouter.get('/resource/video-stream/:name', serveVideoStreamController)

export default staticRouter
