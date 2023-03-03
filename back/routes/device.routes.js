import express from 'express'
import { authRequired } from '../auth/authRequired.js'
import {
  addDevice,
  addSensorData,
  calibrateInitialDistance,
  calibrateItemWidthAndMaxAmount,
  getDevices,
} from '../controllers/device.controller.js'
import {
  dataAdditionRules,
  deviceAdditionRules,
  initialDistanceRules,
  itemCalibrationRules,
} from '../validations/device.validations.js'

const router = express.Router()

// Add new device
router.post('/add', deviceAdditionRules(), addDevice)

// Add new data
router.post('/data', dataAdditionRules(), addSensorData)

// Calibrate initial distance
router.post('/calibrate/initial/:id', authRequired, initialDistanceRules(), calibrateInitialDistance)

// Calibrate item width and max amount
router.post('/calibrate/item/:id', authRequired, itemCalibrationRules(), calibrateItemWidthAndMaxAmount)

// Get user devices
router.get('/', authRequired, getDevices)

export default router
