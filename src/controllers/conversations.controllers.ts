import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationService from '~/services/conversations.services'

export const conversationController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await conversationService.getConversation(user_id)

  res.json({
    message: 'Conversations found',
    data: result
  })
}
