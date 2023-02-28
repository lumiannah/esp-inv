import express from 'express'
import { authRequired } from '../auth/authRequired.js'
import { addDevice, getDevices } from '../controllers/device.controller.js'

const router = express.Router()

// Add new device
router.post('/add', addDevice)

// Get user devices
router.get('/', authRequired, getDevices)

export default router
