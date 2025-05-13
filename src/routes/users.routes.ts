import { Router } from 'express'
import {
  changePasswordController,
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

/*
  URL: https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fusers%2Foauth%2Fgoogle&client_id=628502265629-1tfr84q4ipbhf6ibrhrv4cdrc3i4j9di.apps.googleusercontent.com&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&service=lso&o2v=2&flowName=GeneralOAuthFlow

  FE: Frontend only redirect to this URL:
    const getOauthGoogleUrl = () => {
      const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
      const options = {
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ].join(' ')
      }
      const qs = new URLSearchParams(options)
      return `${rootUrl}?${qs.toString()}`
    }
*/

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

usersRouter.patch(
  '/change-password',
  accessTokenSchema,
  verifiedUserValidator,
  changePasswordSchema,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
