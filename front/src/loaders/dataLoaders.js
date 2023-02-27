import { getUserAccount } from '../api/UserAPI'

export const userDataLoader = async () => {
  const user = await getUserAccount()
  return user
}
