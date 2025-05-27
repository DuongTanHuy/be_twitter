import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import mediasRouter from './routes/medias.routes'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import { initFolder } from './utils/file'
import cors from 'cors'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import conversationRouter from './routes/conversations.routes'
import initSocket from './utils/socket'

// import '~/utils/faker'

databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers()
    databaseService.indexRefreshTokens()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
    databaseService.indexBookmarks()
    databaseService.indexLikes()
    databaseService.indexHashtags()
    databaseService.indexTweets()
  })
  .catch((err) => {
    console.error('Error connecting to database:', err)
    process.exit(1)
  })

const POST = 3001
const app = express()
initFolder()

// Socket.io
const httpServer = createServer(app)
initSocket(httpServer)

// Express
app.use(cors())
app.use(express.json())

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/conversations', conversationRouter)
app.use('/search', searchRouter)

// Resource
app.use('/static', staticRouter)

// Static
app.use('/static/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_HLS_DIR))

app.use(defaultErrorHandler)

// app.listen(POST, () => {
//   console.log('Express listening on port ' + POST)
// })

httpServer.listen(POST, () => {
  console.log('Express listening on port ' + POST)
})
