import { body, param } from 'express-validator'
import { createHash } from 'crypto'

import { validate } from './validate.js'
import { databaseClient } from '../db/client.js'

// validates: body.email, body.password, body.recaptchaToken
const userCreationRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid E-mail address')
      .normalizeEmail()
      .custom(async (value) => {
        const hashedEmail = createHash('sha256').update(value).digest('base64')
        const user = await databaseClient.user.findUnique({
          where: { email: hashedEmail },
        })
        if (user) return Promise.reject('Invalid E-mail address')
      }),

    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Your password should have at least one number character')
      .matches(/[^\w\d]/)
      .withMessage('Your password should have at least one special character'),

    body('recaptchaToken').not().isEmpty().trim().escape().withMessage('You must not be a robot'),

    validate,
  ]
}

// validates: param.activationCode
const userActivationRules = () => {
  return [param('activationCode').isUUID(4), validate]
}

// validates: body.email, body.password
const userLoginRules = () => {
  return [
    body('email').trim().isEmail().normalizeEmail(),

    body('password')
      .trim()
      .isLength({ min: 8 })
      .matches(/\d/)
      .matches(/[^\w\d]/),

    validate,
  ]
}

// validates: param.id, body.newEmail, body.currentPassword, body.newPassword
const userUpdationRules = () => {
  return [
    param('id').isInt(),

    body('newEmail')
      .trim()
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage('Invalid E-mail address')
      .normalizeEmail()
      .custom(async (value) => {
        const hashedEmail = createHash('sha256').update(value).digest('base64')
        const user = await databaseClient.user.findUnique({
          where: { email: hashedEmail },
        })
        if (user) return Promise.reject('Invalid E-mail address')
      }),

    body('currentPassword')
      .trim()
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ min: 8 })
      .matches(/\d/)
      .matches(/[^\w\d]/),

    body('newPassword')
      .trim()
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Your password should have at least one number character')
      .matches(/[^\w\d]/)
      .withMessage('Your password should have at least one special character'),

    validate,
  ]
}

// validates: param.id, body.password
const userDeletionRules = () => {
  return [
    param('id').isInt(),

    body('password')
      .trim()
      .isLength({ min: 8 })
      .matches(/\d/)
      .matches(/[^\w\d]/),

    validate,
  ]
}

// validates: body.email, body.recaptchaToken
const userRequestNewPasswordRules = () => {
  return [
    body('email').trim().isEmail().withMessage('Invalid E-mail address').normalizeEmail(),

    body('recaptchaToken').not().isEmpty().trim().escape().withMessage('You must not be a robot'),

    validate,
  ]
}

// validates: body.password, body.token, body.id
const userResetNewPasswordRules = () => {
  return [
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Your password should have at least one number character')
      .matches(/[^\w\d]/)
      .withMessage('Your password should have at least one special character'),

    body('token').not().isEmpty().trim().escape().withMessage('You must not be a robot'),

    body('id').isInt(),

    validate,
  ]
}

export {
  userCreationRules,
  userActivationRules,
  userLoginRules,
  userUpdationRules,
  userDeletionRules,
  userRequestNewPasswordRules,
  userResetNewPasswordRules,
}
