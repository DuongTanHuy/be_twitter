import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  participants?: string[]
  unread_count?: number
  created_at?: Date
  updated_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  participants: ObjectId[]
  unread_count: number
  created_at: Date
  updated_at: Date

  constructor(user: ConversationType) {
    const date = new Date()
    this._id = user._id
    this.participants = user.participants ? user.participants.map((participant) => new ObjectId(participant)) : []
    this.unread_count = user.unread_count || 0
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
  }
}
