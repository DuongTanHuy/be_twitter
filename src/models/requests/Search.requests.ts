import { MediaQuery } from '~/constants/enum'
import { Pagination } from './Tweet.requests'

export interface SearchQuery extends Pagination {
  content: string
  media_type: MediaQuery
  people_follow: boolean
}
