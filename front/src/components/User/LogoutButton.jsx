import { useNavigate } from 'react-router-dom'
import { logoutFromAccount } from '../../api/UserAPI'
import { useLogoutUser } from '../../store/store-zustand'

function LogoutButton() {
  const logoutUser = useLogoutUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutFromAccount()
      logoutUser()
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }
  return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton
