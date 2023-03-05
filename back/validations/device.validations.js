import { body, param } from 'express-validator'
import { validate } from './validate.js'

// validates: body.email, body.mac
const deviceAdditionRules = () => {
  return [body('email').trim().isEmail(), body('mac').trim().isMACAddress(), validate]
}

// validates: body.deviceId, body.distance
const dataAdditionRules = () => {
  return [
    body('deviceId').not().isEmpty().escape(),

    body('distance').not().isEmpty().isLength({ min: 1, max: 4 }).escape(),

    validate,
  ]
}

// validates: param.id
const initialDistanceRules = () => {
  return [param('id').isInt(), validate]
}

// validates: param.id, body.itemCount
const itemCalibrationRules = () => {
  return [param('id').isInt(), body('itemCount').isInt(), validate]
}

// validates: param.id
const getDeviceRules = () => {
  return [param('id').isInt(), validate]
}

export { deviceAdditionRules, dataAdditionRules, initialDistanceRules, itemCalibrationRules, getDeviceRules }
