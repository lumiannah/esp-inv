import express from 'express'
import { authRequired } from '../auth/authRequired.js'
import {
  userCreationRules,
  userActivationRules,
  userLoginRules,
  userUpdationRules,
  userDeletionRules,
  userRequestNewPasswordRules,
  userResetNewPasswordRules,
} from '../validations/user.validations.js'
import {
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
} from '../controllers/user.controller.js'

const router = express.Router()

// Creation of new user
router.post('/create', userCreationRules(), createUser)

// New user activation via email link
router.get('/activate/:activationCode', userActivationRules(), activateUser)

// User login
router.post('/login', userLoginRules(), loginUser)

// Get user details
router.get('/', authRequired, getUser)

// Updation of user
router.post('/update/:id', authRequired, userUpdationRules(), updateUser)

// Deletion of user
router.delete('/delete/:id', authRequired, userDeletionRules(), deleteUser)

// User logout
router.post('/logout', authRequired, logoutUser)

// New password request if user has forgotten creds
router.post('/forgot-password', userRequestNewPasswordRules(), requestPasswordReset)

// Updating password by forgot process
router.post('/forgot-password/new', userResetNewPasswordRules(), resetUserPassword)

// User session authentication
router.get('/auth', authRequired, authenticateUserSession)

export default router
