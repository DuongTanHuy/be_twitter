import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversation(user_id: string) {
    const result = await databaseService.conversations
      .find({
        participants: {
          $in: [new ObjectId(user_id)]
        }
      })
      .toArray()

    return result
  }
}

const conversationService = new ConversationService()

export default conversationService
