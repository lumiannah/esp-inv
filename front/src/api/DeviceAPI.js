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

export { calibrateInitialDistance, calibrateItemWidthAndMaxAmount, getUserDevices }
