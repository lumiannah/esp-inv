import { useEffect, useRef } from 'react'
import { ensureUserSession, getUserAccount } from '../../api/UserAPI'
import { useLoginUser, useSetUser } from '../../store/store-zustand'

// check session every time protected route is being accessed
export const protectedRouteLoader = async () => {
  await ensureUserSession()
  return null
}

// runs once per mount, i.e. cold landing the site
// checks if previous session is still valid and automatically log in the user
export const AuthProvider = ({ children }) => {
  const loginUser = useLoginUser()
  const setUser = useSetUser()

  const isMounted = useRef(false)

  const checkAuth = async () => {
    try {
      const user = await getUserAccount()
      setUser(user)
      loginUser()
    } catch (error) {
      if (error.response.status !== 401) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    if (isMounted.current) return
    isMounted.current = true
    checkAuth()
  }, [])

  return children
}
