import express from 'express'
import { authRequired } from '../auth/authRequired.js'
import { addDevice, addSensorData, getDevices } from '../controllers/device.controller.js'
import { dataAdditionRules, deviceAdditionRules } from '../validations/device.validations.js'

const router = express.Router()

// Add new device
router.post('/add', deviceAdditionRules(), addDevice)

// Add new data
router.post('/data', dataAdditionRules(), addSensorData)

// Get user devices
router.get('/', authRequired, getDevices)

export default router
