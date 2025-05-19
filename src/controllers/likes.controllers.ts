import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeTweetReqBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body

  const result = await likesService.likeTweet(user_id, tweet_id)

  return res.json({ message: 'Tweet liked', result })
}

export const unLikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params

  const result = await likesService.unLikeTweet(user_id, tweet_id)

  return res.json({ message: 'Tweet un-liked', result })
}
