import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import { tweetIdSchema } from '~/middlewares/tweets.middlewares'
import { accessTokenSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post('/', accessTokenSchema, verifiedUserValidator, tweetIdSchema, wrapRequestHandler(likeTweetController))

likesRouter.delete(
  '/tweet/:tweet_id',
  accessTokenSchema,
  verifiedUserValidator,
  tweetIdSchema,
  wrapRequestHandler(unLikeTweetController)
)

export default likesRouter
