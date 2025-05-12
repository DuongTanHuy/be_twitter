import dotenv from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGE } from '~/constants/message'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validation } from '~/utils/validation'

dotenv.config()

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGE.PASSWORD_IS_STRING
  },
  isLength: {
    options: {
      max: 50,
      min: 6
    },
    errorMessage: USER_MESSAGE.PASSWORD_IS_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGE.PASSWORD_IS_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_STRING
  },
  isLength: {
    options: {
      max: 50,
      min: 6
    },
    errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGE.PASSWORD_CONFIRM_IS_EQUAL)
      }
      return true
    }
  }
}

export const loginValidatorSchema = validation(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_FORMAT
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USER_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(404).json({ error: 'Missing email or password' })
  }
  next()
}

export const accessTokenSchema = validation(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = (value ?? '').split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.INVALID_ACCESS_TOKEN,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decoded_authorization = decoded_authorization
              return true
            } catch (error: JsonWebTokenError | any) {
              throw new ErrorWithStatus({
                message: capitalize(error.message) || USER_MESSAGE.INVALID_ACCESS_TOKEN,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenSchema = validation(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              req.decoded_refresh_token = decoded_refresh_token
              return true
            } catch (error: JsonWebTokenError | any) {
              throw new ErrorWithStatus({
                message: capitalize(error.message) || USER_MESSAGE.INVALID_REFRESH_TOKEN,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenSchema = validation(
  checkSchema(
    {
      verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              req.decoded_email_verify_token = decoded_email_verify_token
              return true
            } catch (error: JsonWebTokenError | any) {
              throw new ErrorWithStatus({
                message: capitalize(error.message) || USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidatorSchema = validation(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USER_MESSAGE.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGE.NAME_IS_STRING
        },
        isLength: {
          options: {
            max: 100,
            min: 6
          },
          errorMessage: USER_MESSAGE.NAME_IS_LENGTH
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_FORMAT
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistsEmail = await usersService.checkEmailExists(value)
            if (isExistsEmail) {
              throw new Error(USER_MESSAGE.EMAIL_ALREADY_EXISTS)
              // throw new ErrorWithStatus({ message: 'Email already exists', status: 422 })
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordSchema = validation(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_FORMAT
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (user === null) {
              throw new Error(USER_MESSAGE.EMAIL_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const VerifyForgotPasswordSchema = validation(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })

              const { user_id } = decoded_forgot_password_token as TokenPayload

              const user = await databaseService.users.findOne({
                _id: new ObjectId(user_id)
              })
              if (!user) {
                throw new ErrorWithStatus({ message: USER_MESSAGE.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
              } else {
                if (user.verify !== UserVerifyStatus.Verified) {
                  throw new ErrorWithStatus({
                    message: USER_MESSAGE.USER_NOT_VERIFIED,
                    status: HTTP_STATUS.UNAUTHORIZED
                  })
                } else {
                  if (user.forgot_password_token !== value) {
                    throw new ErrorWithStatus({
                      message: USER_MESSAGE.INVALID_FORGOT_PASSWORD_TOKEN,
                      status: HTTP_STATUS.UNAUTHORIZED
                    })
                  }
                }
              }

              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.INVALID_FORGOT_PASSWORD_TOKEN,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordSchema = validation(
  checkSchema(
    {
      reset_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.RESET_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_reset_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })

              req.decoded_reset_password_token = decoded_reset_password_token

              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.INVALID_RESET_PASSWORD_TOKEN,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const forgotPasswordValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body
  if (!email || !otp) {
    return res.status(404).json({
      error: 'Missing email or otp'
    })
  }
}

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    // throw new ErrorWithStatus({ message: 'User not verified', status: HTTP_STATUS.FORBIDDEN })
    // neu la sync middleware thi dung throw error or next con neu la async middleware chi dung next
    return next(new ErrorWithStatus({ message: 'User not verified', status: HTTP_STATUS.FORBIDDEN }))
  }

  next()
}

export const updateMeSchema = validation(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGE.NAME_IS_STRING
        },
        isLength: {
          options: {
            max: 100,
            min: 6
          },
          errorMessage: USER_MESSAGE.NAME_IS_LENGTH
        },
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'Bio must be string'
        },
        isLength: {
          options: {
            max: 1000,
            min: 6
          },
          errorMessage: "Bio's length must be between 6 and 1000"
        },
        trim: true
      },
      location: {
        optional: true,
        isString: {
          errorMessage: 'Location must be string'
        },
        isLength: {
          options: {
            max: 100,
            min: 6
          },
          errorMessage: "Location's length must be between 6 and 100"
        },
        trim: true
      },
      website: {
        optional: true,
        isURL: {
          errorMessage: 'Website must be URL'
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: 'Username must be string'
        },
        // isLength: {
        //   options: {
        //     max: 50,
        //     min: 6
        //   },
        //   errorMessage: "Username's length must be between 6 and 50"
        // },
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error('Invalid username')
            }

            const user = await databaseService.users.findOne({
              username: value
            })
            if (user !== null) {
              throw new Error('Username already exists')
            }

            return true
          }
        },
        trim: true
      },
      avatar: {
        optional: true,
        isURL: {
          errorMessage: 'Avatar must be URL'
        }
      },
      cover_photo: {
        optional: true,
        isURL: {
          errorMessage: 'Cover photo must be URL'
        }
      }
    },
    ['body']
  )
)

export const followUserSchema = validation(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new Error('Followed user id is required')
            }

            if (ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid followed user id',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            const followed_user = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: 'Followed user not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unFollowUserSchema = validation(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new Error('Followed user id is required')
            }

            if (ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid followed user id',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            const followed_user = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: 'Followed user not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const changePasswordSchema = validation(
  checkSchema(
    {
      old_password: {
        notEmpty: {
          errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGE.PASSWORD_IS_STRING
        },
        isLength: {
          options: {
            max: 50,
            min: 6
          },
          errorMessage: USER_MESSAGE.PASSWORD_IS_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_IS_STRONG
        },
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (user?.password !== hashPassword(value)) {
              throw new Error('Old password is incorrect')
            }

            return true
          }
        }
      },
      new_password: {
        notEmpty: {
          errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGE.PASSWORD_IS_STRING
        },
        isLength: {
          options: {
            max: 50,
            min: 6
          },
          errorMessage: USER_MESSAGE.PASSWORD_IS_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_IS_STRONG
        },
        custom: {
          options: async (value, { req }) => {
            if (value === req.body.old_password) {
              throw new Error('New password must be different from old password')
            }

            return true
          }
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_STRING
        },
        isLength: {
          options: {
            max: 50,
            min: 6
          },
          errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_CONFIRM_IS_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.new_password) {
              throw new Error(USER_MESSAGE.PASSWORD_CONFIRM_IS_EQUAL)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const isUserLoggedInSchema = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
