import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const { content } = req.query
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const user_id = req?.decoded_authorization?.user_id
  const media_type = req.query.media_type
  const people_follow = req.query.people_follow

  const { tweets, total } = await searchService.searchAggregate({
    content,
    limit,
    page,
    user_id,
    media_type,
    people_follow
  })

  res.json({
    message: 'Tweets found',
    result: {
      tweets,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      total_record: total
    }
  })
}
