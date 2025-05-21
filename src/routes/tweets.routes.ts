import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetsChildrenController,
  getTweetsController
} from '~/controllers/tweets.controllers'
import {
  audienceSchema,
  createTweetSchema,
  getTweetChildrenSchema,
  paginationSchema,
  tweetIdSchema
} from '~/middlewares/tweets.middlewares'
import { accessTokenSchema, isUserLoggedInSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: create a tweet
 * Path: /
 * Method: POST
 * Body: {...}
 */

tweetsRouter.post(
  '/',
  accessTokenSchema,
  verifiedUserValidator,
  createTweetSchema,
  wrapRequestHandler(createTweetController)
)

tweetsRouter.get(
  '/:tweet_id',
  tweetIdSchema,
  isUserLoggedInSchema(accessTokenSchema),
  isUserLoggedInSchema(verifiedUserValidator),
  wrapRequestHandler(audienceSchema),
  wrapRequestHandler(getTweetsController)
)

tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdSchema,
  getTweetChildrenSchema,
  paginationSchema,
  isUserLoggedInSchema(accessTokenSchema),
  isUserLoggedInSchema(verifiedUserValidator),
  wrapRequestHandler(audienceSchema),
  wrapRequestHandler(getTweetsChildrenController)
)

tweetsRouter.get(
  '/',
  paginationSchema,
  accessTokenSchema,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default tweetsRouter
