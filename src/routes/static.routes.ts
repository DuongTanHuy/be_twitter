import { Router } from 'express'
import {
  serveImageController,
  serveSegmentController,
  serveVideoHlsM3u8Controller,
  serveVideoStreamController
} from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/resource/image/:name', serveImageController)
staticRouter.get('/resource/video-stream/:name', serveVideoStreamController)
staticRouter.get('/resource/video-hls/:id/master', serveVideoHlsM3u8Controller)
staticRouter.get('/resource/video-hls/:id/:v/:segment', serveSegmentController)

export default staticRouter
