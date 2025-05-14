import path from 'path'
import fs from 'fs'
import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import mediasServices from '~/services/medias.services'
import { USER_MESSAGE } from '~/constants/message'

export const updateImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasServices.handleUploadImage(req)
  return res.json({
    message: USER_MESSAGE.UPLOAD_IMAGE_SUCCESS,
    image_url: data
  })
}

export const updateVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasServices.handleUploadVideo(req)
  return res.json({
    message: 'Upload video successful',
    video_url: data
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const fileName = name.split('.')[1] === 'jpg' ? name : `${name}.jpg`

  return res.sendFile(fileName, { root: 'uploads/images' }, (error) => {
    if (error) {
      next(new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: 'Image not found' }))
    }
  })
}

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range || 'bytes=1048576-'
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }
  // Duong dan video
  const { name } = req.params
  const videoPath = path.resolve('uploads/videos', name)
  // Dung luong video
  const videoSize = fs.statSync(videoPath).size
  // Dung luong cho moi phan doan video
  const CHUNK_SIZE = 10 ** 6
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1

  // const mime = (import('mime') as any).default
  // const contentType = mime.getType(videoPath) || 'video/*'
  const contentType = 'video/mp4'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
