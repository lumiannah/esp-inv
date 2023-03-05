import { api } from './API'

const calibrateInitialDistance = async (deviceId) => {
  await api.post('/device/calibrate/initial/' + deviceId)
}

const calibrateItemWidthAndMaxAmount = async (deviceId, itemCount) => {
  await api.post('/device/calibrate/item/' + deviceId, {
    itemCount,
  })
}

const getUserDevices = async () => {
  const response = await api.get('/device')
  return response.data
}

const getUserDeviceById = async (deviceId) => {
  const response = await api.get('/device/' + deviceId)
  return response.data
}

const updateUserDeviceById = async (deviceId, name, description) => {
  await api.put('/device/' + deviceId, {
    name,
    description,
  })
}

export {
  calibrateInitialDistance,
  calibrateItemWidthAndMaxAmount,
  getUserDevices,
  getUserDeviceById,
  updateUserDeviceById,
}
