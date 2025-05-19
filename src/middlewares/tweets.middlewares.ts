import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetCategory } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGE } from '~/constants/message'
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
          errorMessage: TWEET_MESSAGE.INVALID_TWEET_TYPE
        }
      },
      audience: {
        isIn: {
          options: [numberEnumToArray(TweetAudience)],
          errorMessage: TWEET_MESSAGE.INVALID_TWEET_AUDIENCE
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
              throw new Error(TWEET_MESSAGE.INVALID_PARENT_TWEET_ID)
            }

            if (type === TweetCategory.Tweet && value !== null) {
              throw new Error(TWEET_MESSAGE.PARENT_TWEET_ID_MUST_BE_NULL)
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
              throw new Error(TWEET_MESSAGE.CONTENT_MUST_NOT_BE_EMPTY)
            }

            if (type === TweetCategory.Retweet && value !== '') {
              throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_EMPTY)
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value) => {
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEET_MESSAGE.HASHTAG_MUST_BE_ARRAY_OF_STRING)
            }

            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value) => {
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEET_MESSAGE.MENTION_MUST_BE_ARRAY_OF_USER_ID)
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value) => {
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !numberEnumToArray(MediaType).includes(item.type)
              })
            ) {
              throw new Error(TWEET_MESSAGE.MEDIA_MUST_BE_ARRAY_OF_OBJECT_WITH_URL_AND_TYPE)
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
