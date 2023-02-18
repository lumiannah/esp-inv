import cors from 'cors'
import express from 'express'
import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import passport from 'passport'
import helmet from 'helmet'

import { initPassportConfig } from './auth/passport-config.js'
import { databaseClient } from './db/client.js'
import userRoutes from './routes/user.routes.js'
import deviceRoutes from './routes/device.routes.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))

app.use(
  cors({
    origin: process.env.REACT_ORIGIN_URL,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
)

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
  store: new PrismaSessionStore(databaseClient, {
    checkPeriod: 2 * 60 * 1000, // (2min) interval to remove expired sessions
    dbRecordIdIsSessionId: true,
  }),
})

app.use(sessionMiddleware)

// passport inits
initPassportConfig(passport)
app.use(passport.initialize())
app.use(passport.session())

//// endpoint registrations

// User routes
app.use(`${process.env.API_URL}/user/`, userRoutes)

// Devices routes
app.use(`${process.env.API_URL}/device/`, deviceRoutes)

// Helper function to remove empty values from jsons for minimal data as possible
app.set(`json replacer`, (_, v) => (v === null ? undefined : v))

export default app
