import { Router } from 'express'
import {
  followUserController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowUserController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  VerifyForgotPasswordSchema,
  accessTokenSchema,
  changePasswordSchema,
  emailVerifyTokenSchema,
  followUserSchema,
  forgotPasswordSchema,
  loginValidatorSchema,
  refreshTokenSchema,
  registerValidatorSchema,
  resetPasswordSchema,
  unFollowUserSchema,
  updateMeSchema,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/register', registerValidatorSchema, wrapRequestHandler(registerController))

usersRouter.post('/login', loginValidatorSchema, wrapRequestHandler(loginController))

usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

usersRouter.post('/logout', accessTokenSchema, refreshTokenSchema, wrapRequestHandler(logoutController))

usersRouter.post('/refresh-token', refreshTokenSchema, wrapRequestHandler(refreshTokenController))

usersRouter.post('/verify-email', emailVerifyTokenSchema, wrapRequestHandler(verifyEmailController))

usersRouter.post('/resend-verify-email', accessTokenSchema, wrapRequestHandler(resendVerifyEmailController))

usersRouter.post('/forgot-password', forgotPasswordSchema, wrapRequestHandler(forgotPasswordController))

usersRouter.post(
  '/verify-forgot-password',
  VerifyForgotPasswordSchema,
  wrapRequestHandler(verifyForgotPasswordController)
)

usersRouter.post('/reset-password', resetPasswordSchema, wrapRequestHandler(resetPasswordController))

usersRouter.get('/me', accessTokenSchema, wrapRequestHandler(getMeController))

usersRouter.patch(
  '/me',
  accessTokenSchema,
  verifiedUserValidator,
  updateMeSchema,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

usersRouter.get('/:username', wrapRequestHandler(getProfileController))

usersRouter.post(
  '/follow',
  accessTokenSchema,
  verifiedUserValidator,
  followUserSchema,
  wrapRequestHandler(followUserController)
)

usersRouter.delete(
  '/follow/:user_id',
  accessTokenSchema,
  verifiedUserValidator,
  unFollowUserSchema,
  wrapRequestHandler(unFollowUserController)
)

usersRouter.put(
  '/change-password',
  accessTokenSchema,
  verifiedUserValidator,
  changePasswordSchema,
  wrapRequestHandler(resetPasswordController)
)

export default usersRouter
