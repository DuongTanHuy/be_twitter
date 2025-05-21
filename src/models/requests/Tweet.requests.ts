import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetCategory } from '~/constants/enum'
import { Media } from '../Other'

export interface TweetReqBody {
  type: TweetCategory
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string
}

export interface TweetQuery extends Pagination, Query {
  tweet_type: string
}

export interface Pagination {
  limit: string
  page: string
}
