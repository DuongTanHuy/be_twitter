import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true
    })
  }
  if (!fs.existsSync(path.resolve(UPLOAD_IMAGE_DIR))) {
    fs.mkdirSync(path.resolve(UPLOAD_IMAGE_DIR), {
      recursive: true
    })
  }
  if (!fs.existsSync(path.resolve(UPLOAD_VIDEO_DIR))) {
    fs.mkdirSync(path.resolve(UPLOAD_VIDEO_DIR), {
      recursive: true
    })
  }
}

export const uploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    maxFileSize: 300 * 1024,
    maxTotalFileSize: 4 * 300 * 1024,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
      const valid = allowedMimeTypes.includes(mimetype as string) && name === 'image'

      if (!valid) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Invalid file type'
          }) as any
        )
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.image) {
        return reject(
          new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Image is required'
          })
        )
      }

      resolve(files.image as File[])
    })
  })
}

export const uploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    // keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const allowedMimeTypes = ['video/mp4']
      const valid = allowedMimeTypes.includes(mimetype as string) && name === 'video'

      if (!valid) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Invalid file type'
          }) as any
        )
      }

      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.video) {
        return reject(
          new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Video is required'
          })
        )
      }

      const video = (files.video as File[])[0]
      fs.renameSync(video.filepath, path.resolve(UPLOAD_VIDEO_DIR, video.newFilename + '.mp4'))
      resolve(video)
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const name = fullName.split('.')
  name.pop()
  return name[0]
}
