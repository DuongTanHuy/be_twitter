import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdSchema } from '~/middlewares/tweets.middlewares'
import { accessTokenSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

bookmarksRouter.post(
  '/',
  accessTokenSchema,
  verifiedUserValidator,
  tweetIdSchema,
  wrapRequestHandler(bookmarkTweetController)
)

bookmarksRouter.delete(
  '/tweet/:tweet_id',
  accessTokenSchema,
  verifiedUserValidator,
  tweetIdSchema,
  wrapRequestHandler(unBookmarkTweetController)
)

export default bookmarksRouter
