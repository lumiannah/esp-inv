import { Server } from 'socket.io'
import passport from 'passport'

import { sessionMiddleware } from './app.js'
import { databaseClient } from './db/client.js'
const { REACT_ORIGIN_URL } = process.env

export const initWebSocket = (httpServer) => {
  // Socket.IO
  const socketIo = new Server(httpServer, {
    cors: {
      origin: REACT_ORIGIN_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/notifications',
  })

  // convert a connect middleware to a Socket.IO middleware
  const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next)

  socketIo.use(wrap(sessionMiddleware))
  socketIo.use(wrap(passport.initialize()))
  socketIo.use(wrap(passport.session()))

  socketIo.on('connection', async (socket) => {
    const userId = socket.request.session.passport.user
    const userDevices = await databaseClient.device.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    })

    // join rooms corresponding to their device ids
    for (const device of userDevices) {
      socket.join(device.id)
      console.log(`userId: ${userId} connected by deviceId: ${device.id}`)
    }

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
