import './config.js'
import { createServer } from 'http'
import app from './app.js'
import { initWebSocket } from './websocket.js'

// custom 404
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(404).send('Nothing to see here.')
})

// custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Now you broke it!')
})

const httpServer = createServer(app)

// Socket.IO
export const socketIo = initWebSocket(httpServer)

httpServer.listen(process.env.NODE_PORT)
