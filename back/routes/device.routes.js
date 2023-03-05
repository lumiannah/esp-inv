import express from 'express'
import { authRequired } from '../auth/authRequired.js'
import {
  addDevice,
  addSensorData,
  calibrateInitialDistance,
  calibrateItemWidthAndMaxAmount,
  getUserDeviceById,
  getUserDevices,
} from '../controllers/device.controller.js'
import {
  dataAdditionRules,
  deviceAdditionRules,
  getDeviceRules,
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
router.get('/', authRequired, getUserDevices)

// Get user device by Id
router.get('/:id', authRequired, getDeviceRules(), getUserDeviceById)

export default router
