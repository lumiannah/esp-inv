import { api } from './API'

const createNewAccount = async (formData) => {
  const response = await api.post(
    '/user/create',
    JSON.stringify({
      ...formData,
    })
  )
  return response.data
}

const loginToAccount = async (formData) => {
  await api.post(
    '/user/login',
    JSON.stringify({
      ...formData,
    })
  )
}

const logoutFromAccount = async () => {
  await api.post('/user/logout')
}

const getUserAccount = async () => {
  const response = await api.get('/user')
  return response.data
}

const updateUserAccount = async (userId, formData) => {
  const response = await api.put(
    `/user/update/${userId}`,
    JSON.stringify({
      ...formData,
    })
  )
  return response.data
}

const requestNewPassword = async (formData) => {
  const response = await api.post(
    '/user/forgot-password',
    JSON.stringify({
      ...formData,
    })
  )
  return response.data
}

const resetUserPassword = async (formData) => {
  const response = await api.post(
    '/user/forgot-password/new',
    JSON.stringify({
      ...formData,
    })
  )
  return response.data
}

const ensureUserSession = async () => {
  await api.get('/user/auth')
}

export {
  createNewAccount,
  loginToAccount,
  logoutFromAccount,
  getUserAccount,
  updateUserAccount,
  requestNewPassword,
  resetUserPassword,
  ensureUserSession,
}
