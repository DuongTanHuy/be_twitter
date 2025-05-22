import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config()

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

export const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.htm'), 'utf-8')

export const sendVerifyRegisterEmail = ({
  toAddress,
  template = verifyEmailTemplate,
  username,
  link
}: {
  toAddress: string
  template?: string
  username: string
  link: string
}) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    template.replace(/\[USERNAME\]/g, username).replace(/\[YOUR_VERIFICATION_LINK_HERE\]/g, link)
  )
}

export const sendVerifyForgotPasswordEmail = ({
  toAddress,
  template = verifyEmailTemplate,
  username,
  link
}: {
  toAddress: string
  template?: string
  username: string
  link: string
}) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    template.replace(/\[USERNAME\]/g, username).replace(/\[YOUR_VERIFICATION_LINK_HERE\]/g, link)
  )
}
