import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_HLS_DIR } from '~/constants/dir'
import { getFiles, getNameFromFullName, uploadImage, uploadVideo, uploadVideoHls } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/aws-s3'

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)

    const idName = (item.split('\\').pop() as string).split('.mp4')[0]

    await databaseService.videoStatus
      .insertOne(new VideoStatus({ name: idName, status: EncodingStatus.Pending }))
      .catch(console.log)

    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) {
      return
    }
    this.encoding = true
    const item = this.items.shift()
    if (item) {
      const idName = (item.split('\\').pop() as string).split('.mp4')[0]

      await databaseService.videoStatus.updateOne({ name: idName }, [
        {
          $set: {
            status: EncodingStatus.Processing,
            updated_at: '$$NOW'
          }
        }
      ])

      try {
        encodeHLSWithMultipleVideoStreams(item).then(async () => {
          // fs.unlinkSync(item)

          const files = getFiles(path.resolve(UPLOAD_VIDEO_HLS_DIR, idName))

          await Promise.all(
            files.map((filepath) => {
              const pathname = filepath.split(`${path.resolve(UPLOAD_VIDEO_HLS_DIR, idName)}/`)[1]

              if (pathname && !pathname.includes('.mp4')) {
                return uploadFileToS3({
                  fileName: `videos/hls/${idName}/` + pathname,
                  filePath: filepath,
                  contentType: 'video/mp4'
                })
              }
            })
          )

          await databaseService.videoStatus
            .updateOne({ name: idName }, [
              {
                $set: {
                  status: EncodingStatus.Completed,
                  updated_at: '$$NOW'
                }
              }
            ])
            .catch(console.log)

          console.log('Video encoded successfully:', item)
        })
      } catch (error) {
        console.log('Error encoding video:', error)

        await databaseService.videoStatus
          .updateOne({ name: idName }, [
            {
              $set: {
                status: EncodingStatus.Failed,
                updated_at: '$$NOW'
              }
            }
          ])
          .catch(console.log)
      } finally {
        this.encoding = false
      }

      this.processEncode()
    } else {
      this.encoding = false
    }
  }
}

const queue = new Queue()

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await uploadImage(req)
    const url_image: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file?.newFilename)
        const newFullFileName = newName + '.jpg'
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)

        await sharp(file?.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          fileName: 'images/' + newFullFileName,
          filePath: newPath
        })

        // rimrafSync(file.filepath)
        // fs.unlinkSync(file.filepath)
        // fs.unlinkSync(newPath)

        return {
          url: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/image/${newFullFileName}`,
          url_resource: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/resource/image/${newFullFileName}`,
          s3_url: s3Result.Location,
          type: MediaType.Image
        }
      })
    )
    return url_image
  }

  async handleUploadVideo(req: Request) {
    const videos = await uploadVideo(req)

    const url_video: Media[] = await Promise.all(
      videos.map(async (file) => {
        const s3Result = await uploadFileToS3({
          fileName: 'videos/streaming/' + file?.newFilename,
          filePath: file?.filepath,
          contentType: 'video/mp4'
        })

        return {
          url: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/video/${file?.newFilename}`,
          url_resource: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/resource/video-stream/${file?.newFilename}`,
          s3_url: s3Result.Location,
          type: MediaType.Video
        }
      })
    )

    return url_video
  }

  async handleUploadHlsVideo(req: Request) {
    const videos = await uploadVideoHls(req)

    const url_video: Media[] = await Promise.all(
      videos.map(async (file) => {
        // await encodeHLSWithMultipleVideoStreams(file.filepath)

        // fs.unlinkSync(file.filepath)

        queue.enqueue(file.filepath)

        return {
          id: file?.newFilename.split('.mp4')[0],
          url: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/video/${(file?.newFilename as string).split('.mp4')[0]}/${file?.newFilename}`,
          url_resource: `${isProduction ? 'https://twitter-api-jt4d.onrender.com' : 'http://localhost:3001'}/static/resource/video-hls/${(file?.newFilename as string).split('.mp4')[0]}/master`,
          type: MediaType.Video
        }
      })
    )

    return url_video
  }

  async handleGetVideoStatus(id: string) {
    const result = await databaseService.videoStatus.findOne({ name: id })

    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
