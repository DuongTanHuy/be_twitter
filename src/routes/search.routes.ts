import { paginationSchema } from './../middlewares/tweets.middlewares'
import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchSchema } from '~/middlewares/search.middlewares'
import { accessTokenSchema, isUserLoggedInSchema, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get(
  '/',
  paginationSchema,
  searchSchema,
  isUserLoggedInSchema(accessTokenSchema),
  isUserLoggedInSchema(verifiedUserValidator),
  wrapRequestHandler(searchController)
)

export default searchRouter
