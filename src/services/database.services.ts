import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import Message from '~/models/schemas/Message.schema'

dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.wwfigpg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1', 'name_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ password: 1 })
      this.users.createIndex({ username: 1 }, { unique: true })
      this.users.createIndex({ name: 1 })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0 // Automatically remove documents after expiration
        }
      )
    }
  }

  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(['name_1', 'status_1'])
    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
      this.videoStatus.createIndex({ status: 1 })
    }
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1', 'user_id_1', 'twitter_circle_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
      this.followers.createIndex({ user_id: 1 })
      this.followers.createIndex({ twitter_circle: 1 })
    }
  }

  async indexBookmarks() {
    const exists = await this.bookmarks.indexExists(['user_id_1_tweet_id_1', 'tweet_id_1'])
    if (!exists) {
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 })
      this.bookmarks.createIndex({ tweet_id: 1 })
    }
  }

  async indexLikes() {
    const exists = await this.likes.indexExists(['user_id_1_tweet_id_1', 'tweet_id_1'])
    if (!exists) {
      this.likes.createIndex({ user_id: 1, tweet_id: 1 })
      this.likes.createIndex({ tweet_id: 1 })
    }
  }

  async indexHashtags() {
    const exists = await this.hashtags.indexExists(['name_1'])
    if (!exists) {
      this.hashtags.createIndex({ name: 1 })
    }
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text', 'parent_id_1', 'user_id_1', 'audience_1'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
      this.tweets.createIndex({ parent_id: 1 })
      this.tweets.createIndex({ user_id: 1 })
      this.tweets.createIndex({ audience: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLLECTION as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKE_COLLECTION as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(process.env.DB_CONVERSATION_COLLECTION as string)
  }

  get messages(): Collection<Message> {
    return this.db.collection(process.env.DB_MESSAGE_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
