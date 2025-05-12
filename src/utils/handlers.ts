import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapRequestHandler = (func: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // const handler = new Promise<void>((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve()
    //   }, 1000)
    // })

    func(req, res, next).catch(next)
  }
}

export const wrapRequestHandlerTryCatch = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const wrapRequestHandlerPromise = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => Promise.resolve(func(req, res, next)).catch(next)
}

// export const wrapAsyncPromise = (func: RequestHandler) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(func(req, res, next)).catch(next)
//   }
// }
