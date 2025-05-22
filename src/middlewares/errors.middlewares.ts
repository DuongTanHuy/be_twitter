import { ErrorWithStatus } from '~/models/Errors'
import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { omit } from 'lodash'

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (error instanceof ErrorWithStatus) {
      return res.status(error.status).json(omit(error, 'status'))
    }
    const finalError = {} as any
    Object.getOwnPropertyNames(error).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(error, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(error, key)?.writable
      ) {
        return
      }
      finalError[key] = error[key]
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message || 'Not implemented',
      errorInfo: omit(finalError, 'stack')
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(error as any, 'stack')
    })
  }
  // res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(error, ['status']))
}
