import { useEffect } from 'react'
import { useLoaderData } from 'react-router-dom'
import { useSetUser } from '../store/store-zustand'
import LogoutButton from '../components/User/LogoutButton'

function User() {
  const user = useLoaderData()
  const setUser = useSetUser()

  useEffect(() => {
    setUser(user)
  }, [])
  return (
    <div>
      <h2>User</h2>
      <LogoutButton />
    </div>
  )
}

export default User
