import { Request } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  const accessToken = (access_token ?? '').split(' ')[1]
  if (!accessToken) {
    throw new ErrorWithStatus({
      message: USER_MESSAGE.INVALID_ACCESS_TOKEN,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: accessToken,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      req.decoded_authorization = decoded_authorization
      return true
    }

    return decoded_authorization
  } catch (error: JsonWebTokenError | any) {
    throw new ErrorWithStatus({
      message: capitalize(error.message) || USER_MESSAGE.INVALID_ACCESS_TOKEN,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
