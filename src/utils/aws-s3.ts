import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'

const s3 = new S3({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
})

// s3.listBuckets({}).then((data) => {
//   console.log(data)
// })

export const uploadFileToS3 = ({
  fileName,
  filePath,
  contentType = 'image/jpeg'
}: {
  fileName: string
  filePath: string
  contentType?: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: process.env.S3_BUCKET_NAME, Key: fileName, Body: filePath, ContentType: contentType },

    // optional tags
    tags: [],

    // (optional) concurrency configuration
    queueSize: 4,

    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,

    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  })

  return parallelUploads3.done()
}

export const sendFileToS3 = async (res: Response, filepath: string) => {
  try {
    const data = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: filepath
    })
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('File not found')
  }
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((result) => {
//   console.log(result)
// })
