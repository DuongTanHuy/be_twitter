import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetCategory } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { validation } from '~/utils/validation'

export const createTweetSchema = validation(
  checkSchema(
    {
      type: {
        isIn: {
          options: [numberEnumToArray(TweetCategory)],
          errorMessage: 'Invalid tweet type'
        }
      },
      audience: {
        isIn: {
          options: [numberEnumToArray(TweetAudience)],
          errorMessage: 'Invalid tweet audience'
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetCategory

            if (
              [TweetCategory.Retweet, TweetCategory.Comment, TweetCategory.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error('Invalid parent tweet id')
            }

            if (type === TweetCategory.Tweet && value !== null) {
              throw new Error('Parent tweet id must be null')
            }

            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetCategory
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            if (
              [TweetCategory.Tweet, TweetCategory.Comment, TweetCategory.QuoteTweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error('Content must not be empty')
            }

            if (type === TweetCategory.Retweet && value !== '') {
              throw new Error('Content must be empty')
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error('Hashtags must be an array of strings')
            }

            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error('Mentions must be an array of user ids')
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !numberEnumToArray(MediaType).includes(item.type)
              })
            ) {
              throw new Error('Medias must be an array of objects with url and type')
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
export const tweetIdSchema = validation(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid tweet id',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })

            if (!tweet) {
              throw new ErrorWithStatus({
                message: 'Tweet not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
