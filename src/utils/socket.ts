import { Server } from 'socket.io'
import { verifyAccessToken } from './commons'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGE } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from '~/services/database.services'
import Message from '~/models/schemas/Message.schema'
import { Server as HttpServer } from 'http'

const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })

  const users = new Map<
    string,
    {
      socket_id: string
    }
  >()

  // middleware truoc khi tao ket noi
  io.use(async (socket, next) => {
    try {
      const Authorization = socket.handshake.auth?.Authorization

      const { verify, user_id } = (await verifyAccessToken(Authorization)) as TokenPayload

      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({ message: USER_MESSAGE.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN })
      }

      socket.handshake.auth.user_id = user_id
      socket.handshake.auth.Authorization = Authorization
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // const user_id = socket.handshake.auth?.user_id
    const user_id = socket.handshake.auth?.user_id_client

    if (user_id) {
      users.set(user_id, {
        socket_id: socket.id
      })
    }

    console.log(users)

    // Middleware moi lan emit event
    socket.use(async (packet, next) => {
      try {
        const Authorization = socket.handshake.auth?.Authorization

        ;(await verifyAccessToken(Authorization)) as TokenPayload

        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('send_private_message', async (data) => {
      const { to, conversation_id, content } = data

      await databaseService.messages.insertOne(
        new Message({
          conversation_id,
          sender_id: content.senderId,
          body: content.body,
          created_at: content.createdAt,
          updated_at: content.createdAt
        })
      )

      to.forEach((userId: string) => {
        if (users.has(userId)) {
          const receiverSocketId = users.get(userId)?.socket_id

          if (receiverSocketId) {
            socket.to(receiverSocketId).emit('receive_private_message', {
              sender_id: userId,
              content
            })
          }
        }
      })
    })

    socket.on('disconnect', () => {
      if (user_id) {
        users.delete(user_id)
      }
      console.log('User disconnected')
    })
  })
}

export default initSocket
