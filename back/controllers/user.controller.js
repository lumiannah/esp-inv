import passport from 'passport'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'

import { databaseClient } from '../db/client.js'

import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendActivationEmail = async (email, activationCode) => {
  const message = {
    to: email,
    from: process.env.APP_EMAIL,
    subject: `Confirm your account on ${process.env.APP_NAME}`,
    text: `Thanks for signing up with ${process.env.APP_NAME}! You must follow this link within 7 days of registration to activate your account. ${process.env.API_URL}/users/activate/${activationCode}`,
    html: `
      <p>Thanks for signing up with ${process.env.APP_NAME}! You must follow this link within 7 days of registration to activate your account:</p>
      <br>
      <a href="${process.env.API_URL}/user/activate/${activationCode}">Activate your account here.</a>
    `,
  }
  await sgMail.send(message)
}

const createUser = async (req, res) => {
  const { email, password, recaptchaToken } = req.body

  try {
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    })
    const { success } = await recaptchaResponse.json()
    if (!success || !recaptchaToken) res.sendStatus(401)

    // hash credintials
    const hashedPassword = await bcrypt.hash(password, 10)
    const hashedEmail = createHash('sha256').update(email).digest('base64')

    // create a new user and return activation_code
    const newUser = await databaseClient.user.create({
      data: {
        email: hashedEmail,
        password: hashedPassword,
        activated: true, // set activated status automatically to true for testing purposes
      },
      select: {
        activation_code: true,
      },
    })

    // await sendActivationEmail(email, newUser.activation_code)
    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const activateUser = async (req, res) => {
  const activationCode = req.params.activationCode
  try {
    await databaseClient.user.update({
      where: {
        activation_code: activationCode,
      },
      data: {
        activated: true,
      },
    })
    return res.redirect(`${process.env.REACT_ORIGIN_URL}/login`)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const loginUser = async (req, res, next) => {
  passport.authenticate('local', (error, user) => {
    if (error) {
      console.error(error)
      return res.sendStatus(500)
    }
    if (!user) return res.sendStatus(401)
    if (!user.activated) return res.sendStatus(403)

    // passport login
    req.login(user, (error) => {
      if (error) {
        console.error(error)
        return res.sendStatus(500)
      }
      return res.sendStatus(200)
    })
  })(req, res, next)
}

const getUser = async (req, res) => {
  // const user = await databaseClient.user.findUnique({
  //   where: {
  //     id: req.user.id,
  //   },
  //   select: {
  //     id: true,
  //     // ....
  //   },
  // })
  return res.status(200).json({ id: req.user.id })
}

const updateUser = async (req, res) => {
  const id = req.user.id

  if (id !== +req.params.id) return res.sendStatus(401)

  try {
    const { newEmail, currentPassword, newPassword } = req.body

    // to update email or password, require current password
    if (currentPassword) {
      const user = await databaseClient.user.findUnique({
        where: { id },
        select: {
          password: true,
        },
      })

      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)

      if (!isPasswordMatch) {
        return res.sendStatus(403)
      }

      // when updating email
      if (newEmail) {
        await databaseClient.user.update({
          where: { id },
          data: {
            hashed_email: createHash('sha256').update(newEmail).digest('base64'),
            encrypted_email: encrypt(newEmail),
          },
        })
      }

      // when updating password
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await databaseClient.user.update({
          where: { id },
          data: {
            password: hashedPassword,
          },
        })
      }
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const deleteUser = async (req, res, next) => {
  const id = req.user.id
  if (id !== +req.params.id) return res.sendStatus(401)

  try {
    const user = await databaseClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    })

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)

    if (!isPasswordMatch) {
      return res.sendStatus(403)
    }

    await databaseClient.user.delete({
      where: { id },
    })

    await req.logout((error) => {
      if (error) {
        return next(error)
      }
      req.session.destroy()
      res.clearCookie('connect.sid', { path: '/' }).sendStatus(200)
      // res.redirect('/')
    })
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const logoutUser = async (req, res, next) => {
  await req.logout((error) => {
    if (error) {
      return next(error)
    }
    req.session.destroy()
    res.clearCookie('connect.sid', { path: '/' }).sendStatus(200)
    // res.redirect('/')
  })
}

const requestPasswordReset = async (req, res) => {
  const { email, recaptchaToken } = req.body

  try {
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    })
    const { success } = await recaptchaResponse.json()
    if (!success) res.sendStatus(401)

    const user = await databaseClient.user.findUnique({
      where: {
        hashed_email: createHash('sha256').update(email).digest('base64'),
      },
      select: {
        id: true,
      },
    })

    // return success even if there isn't user for requested email
    if (!user) return res.sendStatus(201)

    // find and clean prev tokens if exists
    const storedToken = await databaseClient.token.findUnique({
      where: {
        user_id: user.id,
      },
    })

    if (storedToken) {
      await databaseClient.token.delete({
        where: {
          user_id: storedToken.user_id,
        },
      })
    }

    const resetToken = randomBytes(32).toString('hex')
    const hashedToken = await bcrypt.hash(resetToken, 10)

    await databaseClient.token.create({
      data: {
        token: hashedToken,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    await sendPasswordResetEmail(email, resetToken, user.id)
    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const resetUserPassword = async (req, res) => {
  const { token, id, password } = req.body

  try {
    const storedToken = await databaseClient.token.findUnique({
      where: {
        user_id: id,
      },
    })

    const isValidToken = await bcrypt.compare(token, storedToken.token)
    const isExpiredToken = +new Date(storedToken.date_expires) < +new Date()

    if (!isValidToken || isExpiredToken) return res.sendStatus(403)

    const hashedPassword = await bcrypt.hash(password, 10)

    await databaseClient.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const authenticateUserSession = async (req, res) => {
  if (req.user) return res.sendStatus(200)
  else return res.sendStatus(401)
}

export {
  createUser,
  activateUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  logoutUser,
  requestPasswordReset,
  resetUserPassword,
  authenticateUserSession,
}
