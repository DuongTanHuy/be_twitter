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

databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers()
    databaseService.indexRefreshTokens()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
  })
  .catch((err) => {
    console.error('Error connecting to database:', err)
    process.exit(1)
  })

const POST = 3001
const app = express()
initFolder()

app.use(cors())
app.use(express.json())

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)

// Resource
app.use('/static', staticRouter)

// Static
app.use('/static/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_HLS_DIR))

app.use(defaultErrorHandler)

app.listen(POST, () => {
  console.log('Express listening on port ' + POST)
})
