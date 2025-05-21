import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { Pagination, TweetParams, TweetQuery, TweetReqBody } from '~/models/requests/Tweet.requests'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import HTTP_STATUS from '~/constants/httpStatus'
import Tweet from '~/models/schemas/Tweet.schema'
import { TweetCategory } from '~/constants/enum'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)

  return res.status(HTTP_STATUS.CREATED).json({ message: 'Tweet created', result })
}

export const getTweetsController = async (req: Request<TweetParams>, res: Response) => {
  const tweet = req.tweet as Tweet

  const { tweet_id } = req.params
  const user_id = req?.decoded_authorization?.user_id

  const result = await tweetsService.increaseView(tweet_id, user_id)

  return res.json({
    message: 'Tweet found',
    result: {
      ...tweet,
      guest_views: result.guest_views,
      user_views: result.user_views,
      updated_at: result.updated_at
    }
  })
}

export const getTweetsChildrenController = async (req: Request<TweetParams, any, any, TweetQuery>, res: Response) => {
  const { tweet_id } = req.params
  const user_id = req?.decoded_authorization?.user_id

  const tweet_type = Number(req.query.tweet_type) as TweetCategory
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { tweets, total } = await tweetsService.getTweetsChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })

  return res.json({
    message: 'Comment found',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit),
      total_record: total
    }
  })
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { tweets, total } = await tweetsService.getNewFeeds({
    limit,
    page,
    user_id
  })

  return res.json({
    message: 'New feeds found',
    result: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit),
      total_record: total
    }
  })
}
