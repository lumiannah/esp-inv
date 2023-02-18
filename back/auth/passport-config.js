import { databaseClient } from '../db/client.js'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'

// Import "Strategy" for Passport
import { Strategy as LocalStrategy } from 'passport-local'

export const initPassportConfig = (passport) => {
  const authLocalUser = async (email, password, done) => {
    try {
      // Check whether user exists in DB by inputted email
      const hashedEmail = createHash('sha256').update(email).digest('base64')
      const user = await databaseClient.user.findUnique({
        where: {
          hashed_email: hashedEmail,
        },
        select: {
          id: true,
          password: true,
          activated: true,
        },
      })

      if (!user) {
        return done(null, false)
      }

      // Check whether inputted password matches with user from DB
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return done(null, false)
      }

      // Auth ok, update login date and return user
      await databaseClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          date_logged: new Date().toISOString(),
        },
      })
      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  }

  /*
  Default form fields for passport are:
  <input type="text" name="username"> req.user.username
  <input type="password" name="password"> req.body.password

  If we wanted to use email instead: <input type="text" name="email">
  Pass an additional object as the first parameter:
  */
  passport.use(new LocalStrategy({ usernameField: 'email' }, authLocalUser))

  // Serialize only user id, i.e. what data to save into session db {"cookie":{"originalMaxAge":43200000,"expires":"2022-11-25T18:09:54.578Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":114}}
  passport.serializeUser((user, done) => {
    return done(null, user.id)
  })

  // Deserialize by user id, i.e. from the data that is saved into db
  passport.deserializeUser(async (id, done) => {
    try {
      // this function is called on every time authed request is being made
      // select only the minimal necessary data that is required through the whole backend
      // its data can be accessed whenever from the req.user object
      const user = await databaseClient.user.findUnique({
        where: { id },
        select: {
          id: true,
          banned: true,
        },
      })
      if (user && user.banned) done(null, false)
      else done(null, user)
    } catch (error) {
      done(error)
    }
  })
}
