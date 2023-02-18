import './config.js'
import { createServer } from 'http'
import app from './app.js'

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

httpServer.listen(process.env.NODE_PORT)
