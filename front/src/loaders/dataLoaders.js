import { getUserDevices } from '../api/DeviceAPI'
import { getUserAccount } from '../api/UserAPI'

export const userDataLoader = async () => {
  const user = await getUserAccount()
  return user
}

export const userDevicesLoader = async () => {
  const devices = await getUserDevices()
  return devices
}
