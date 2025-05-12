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
