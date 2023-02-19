import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginToAccount } from '../api/UserAPI'
import { useIsLoggedIn, useLoginUser } from '../store/store-zustand'

const initialFormData = {
  email: '',
  password: '',
}

function Login() {
  const isLoggedIn = useIsLoggedIn()
  const loginUser = useLoginUser()

  const [formData, setFormData] = useState(initialFormData)
  const [loginErrors, setLoginErrors] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/user'

  const handleInput = (e) => {
    const { id, value } = e.target
    setFormData((current) => ({
      ...current,
      [id]: value,
    }))
    setLoginErrors(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginErrors(false)
    try {
      await loginToAccount(formData)
      loginUser()
      navigate(from, { replace: true })
    } catch (error) {
      setLoginErrors(true)
    }
  }

  if (isLoggedIn) return <Navigate to="/user" state={{ from }} replace />

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label htmlFor="email">Email</label>
      <input value={formData.email} onInput={handleInput} type="email" name="email" id="email" required />

      <label htmlFor="password">Password</label>
      <input value={formData.password} onInput={handleInput} type="password" name="password" id="password" required />

      {loginErrors && <strong className="error">Login failed, check your credentials.</strong>}

      <input type="submit" value="Login" />

      <p>Don't have an account?</p>
      <Link to="/register">Register</Link>
    </form>
  )
}

export default Login
