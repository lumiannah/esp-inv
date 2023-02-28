import { api } from './API'

const getUserDevices = async () => {
  const response = await api.get('/devices')
  return response.data
}

export { getUserDevices }
