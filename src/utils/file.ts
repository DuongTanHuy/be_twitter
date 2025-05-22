import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const initFolder = () => {
  ;[UPLOAD_TEMP_DIR, UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // Muc dich de tao folder nested
      })
    }
  })
}

export const uploadImage = async (req: Request) => {
  const form = formidable({
    // uploadDir: UPLOAD_IMAGE_DIR,
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    maxFileSize: 3000 * 1024,
    maxTotalFileSize: 4 * 3000 * 1024,
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
    maxFiles: 4,
    maxFileSize: 50 * 1024 * 1024,
    maxTotalFileSize: 4 * 50 * 1024 * 1024,
    keepExtensions: true,
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

  return new Promise<File[]>((resolve, reject) => {
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

      const videos = files.video as File[]

      resolve(videos)
    })
  })
}

export const uploadVideoHls = async (req: Request) => {
  const nanoid = (await import('nanoid')).nanoid
  const idName = nanoid()

  const folderPath = path.resolve(UPLOAD_VIDEO_HLS_DIR, idName)

  fs.mkdirSync(folderPath)

  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 4,
    maxFileSize: 50 * 1024 * 1024,
    maxTotalFileSize: 4 * 50 * 1024 * 1024,
    keepExtensions: true,
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
    },
    filename: (name, ext, part) => {
      const fileName = `${idName}${ext}`
      part.originalFilename = fileName
      return fileName
    }
  })

  return new Promise<File[]>((resolve, reject) => {
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

      const videos = files.video as File[]

      resolve(videos)
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const name = fullName.split('.')
  name.pop()
  return name[0]
}

export const getFiles = (dir: string, files: string[] = []) => {
  const fileList = fs.readdirSync(dir)

  for (const file of fileList) {
    const name = `${dir}/${file}`
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files)
    } else {
      files.push(name)
    }
  }
  return files
}
