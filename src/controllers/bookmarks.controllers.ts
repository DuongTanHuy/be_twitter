import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body

  const result = await bookmarksService.bookmarkTweet(user_id, tweet_id)

  return res.json({ message: 'Tweet bookmarked', result })
}

export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params

  const result = await bookmarksService.unBookmarkTweet(user_id, tweet_id)

  return res.json({ message: 'Tweet unbookmarked', result })
}
