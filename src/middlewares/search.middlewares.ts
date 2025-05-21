import { checkSchema } from 'express-validator'
import { MediaQuery } from '~/constants/enum'
import { numberEnumToArray } from '~/utils/commons'
import { validation } from '~/utils/validation'

export const searchSchema = validation(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: 'Content must be a string'
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaQuery)],
          errorMessage: 'Invalid media type'
        }
      },
      people_follow: {
        optional: true,
        isBoolean: {
          errorMessage: 'people_follow must be a boolean'
        }
      }
    },
    ['query']
  )
)
