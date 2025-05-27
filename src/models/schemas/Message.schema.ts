import { ObjectId } from 'mongodb'

interface MessageType {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  body?: string
  created_at?: Date
  updated_at?: Date
}

export default class Message {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  body: string
  created_at: Date
  updated_at: Date

  constructor(user: MessageType) {
    const date = new Date()
    this._id = user._id
    this.conversation_id = user.conversation_id
    this.sender_id = user.sender_id
    this.body = user.body || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
  }
}
