import { Router } from 'express'
import { createTweetController, getTweetsController } from '~/controllers/tweets.controllers'
import { createTweetSchema, tweetIdSchema } from '~/middlewares/tweets.middlewares'
import { accessTokenSchema, isUserLoggedInSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

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
  wrapRequestHandler(getTweetsController)
)

export default tweetsRouter
