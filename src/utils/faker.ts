import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetCategory, UserVerifyStatus } from '~/constants/enum'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { RegisterRequestsBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from './crypto'
import Follower from '~/models/schemas/Follower.schema'
import tweetsService from '~/services/tweets.services'

const PASSWORD = 'User123456@'
const MY_UID = '6822f3310196b239524ec75f'
const USER_COUNT = 100

const createRandomUser = () => {
  const user: RegisterRequestsBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }

  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetCategory.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 100
    }),
    hashtags: [],
    medias: [],
    mentions: [],
    parent_id: null
  }

  return tweet
}

const users: RegisterRequestsBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterRequestsBody[]) => {
  const result = await Promise.all(
    users.map(async (user) => {
      const _id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id,
          username: `user${_id.toString()}`,
          verify: UserVerifyStatus.Verified,
          date_of_birth: new Date(user.date_of_birth),
          password: hashPassword(user.password)
        })
      )
      return _id
    })
  )
  console.log(`Inserted ${result.length} users`)
  return result
}

const followerMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweets = async (ids: ObjectId[]) => {
  const result = await Promise.all(
    ids.map(
      async (id) =>
        await Promise.all([
          tweetsService.createTweet(id.toString(), createRandomTweet()),
          tweetsService.createTweet(id.toString(), createRandomTweet())
        ])
    )
  )
  console.log(`Inserted ${result.length} tweets`)
}

insertMultipleUsers(users).then((ids) => {
  followerMultipleUsers(new ObjectId(MY_UID), ids)
  insertMultipleTweets(ids)
})
