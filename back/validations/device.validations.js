import { body, param } from 'express-validator'
import { validate } from './validate.js'

// validates: body.email, body.mac
const deviceAdditionRules = () => {
  return [body('email').trim().isEmail(), body('mac').trim().isMACAddress(), validate]
}

// validates: body.deviceId, body.distance
const dataAdditionRules = () => {
  return [
    body('deviceId').trim().not().isEmpty().escape(),

    body('distance').trim().not().isEmpty().isLength({ min: 1, max: 4 }).escape(),

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

// validates: param.id, body.name, body.description
const updateDeviceRules = () => {
  return [
    param('id').isInt(),

    body(['deviceName', 'itemId', 'itemName']).trim().optional({ nullable: true, checkFalsy: true }).escape(),

    validate,
  ]
}

export {
  deviceAdditionRules,
  dataAdditionRules,
  initialDistanceRules,
  itemCalibrationRules,
  getDeviceRules,
  updateDeviceRules,
}
