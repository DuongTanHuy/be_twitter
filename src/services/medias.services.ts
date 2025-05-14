import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullName, uploadImage, uploadVideo } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await uploadImage(req)
    const url_image: Media[] = await Promise.all(
      files.map(async (file) => {
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, getNameFromFullName(file?.newFilename) + '.jpg')
        await sharp(file?.filepath).jpeg().toFile(newPath)
        // fs.unlinkSync(file.filepath)
        return {
          url: `${isProduction ? 'https://twitter.com' : 'http://localhost:3001'}/static/image/${getNameFromFullName(
            file?.newFilename
          )}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return url_image
  }

  async handleUploadVideo(req: Request) {
    const videos = await uploadVideo(req)

    const url_video: Media[] = videos.map((file) => ({
      url: `${isProduction ? 'https://twitter.com' : 'http://localhost:3001'}/static/video/${file?.newFilename}`,
      type: MediaType.Video
    }))

    return url_video
  }
}

const mediasServices = new MediasServices()
export default mediasServices
