import { MediaQuery, MediaType, TweetCategory } from '~/constants/enum'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class SearchService {
  async search({ content, limit, page }: { content: string; limit: number; page: number; user_id: string }) {
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .find({
          $text: {
            $search: content
          }
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.tweets.countDocuments({
        $text: {
          $search: content
        }
      })
    ])

    return {
      tweets,
      total
    }
  }

  async searchAggregate({
    content,
    limit,
    page,
    user_id,
    media_type,
    people_follow
  }: {
    content: string
    limit: number
    page: number
    user_id?: string
    media_type?: MediaQuery
    people_follow?: boolean
  }) {
    const $match: any = {
      content: {
        $regex: content,
        $options: 'i'
      }
    }

    if (media_type === MediaQuery.Image) {
      $match['medias.type'] = {
        $in: [MediaType.Image]
      }
    } else if (media_type === MediaQuery.Video) {
      $match['medias.type'] = {
        $in: [MediaType.Video, MediaType.HLS]
      }
    }

    if (people_follow && user_id) {
      const followed_user_ids = await databaseService.followers
        .find({
          user_id: new ObjectId(user_id)
        })
        .toArray()

      const ids = followed_user_ids.map((follower) => follower.followed_user_id)

      ids.push(new ObjectId(user_id))

      if (ids.length > 0) {
        $match['user_id'] = {
          $in: ids
        }
      }
    }
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
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
            }
          },
          {
            $project: {
              user_id: 0,
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const searchService = new SearchService()
export default searchService
