import { Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetCategory, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
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
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid tweet id',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            // destructuring
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'mentions',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    bookmark_count: {
                      $size: '$bookmarks'
                    },
                    like_count: {
                      $size: '$likes'
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'retweet',
                          cond: {
                            $eq: ['$$retweet.type', TweetCategory.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'comment',
                          cond: {
                            $eq: ['$$comment.type', TweetCategory.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'quote',
                          cond: {
                            $eq: ['$$quote.type', TweetCategory.QuoteTweet]
                          }
                        }
                      }
                    }
                    // user_view: {
                    //   $add: ['$guest_views', '$user_views']
                    // }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({
                message: 'Tweet not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            req.tweet = tweet

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceSchema = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: 'Unauthorized',
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const author = await databaseService.users.findOne({
      _id: tweet.user_id
    })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: 'User not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { user_id } = req.decoded_authorization

    const inInTwitterCircle = author.twitter_circle.some((item) => {
      return item.toString() === user_id
    })

    if (!inInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: 'You are not in this Twitter Circle',
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  next()
}

export const getTweetChildrenSchema = validation(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [numberEnumToArray(TweetCategory)],
          errorMessage: TWEET_MESSAGE.INVALID_TWEET_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationSchema = validation(
  checkSchema(
    {
      limit: {
        isInt: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Limit must be between 1 and 100'
        }
      },
      page: {
        isInt: {
          options: {
            min: 1
          },
          errorMessage: 'Page must be greater than 0'
        }
      }
    },
    ['query']
  )
)
