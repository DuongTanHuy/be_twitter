import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)

  return res.json({ message: 'Tweet created', result })
}

export const getTweetsController = async (req: Request, res: Response) => {
  return res.json({ message: 'Get tweets' })
}
