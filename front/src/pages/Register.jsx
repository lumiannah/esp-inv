import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createNewAccount } from '../api/UserAPI'
import ReCAPTCHA from 'react-google-recaptcha'

const initialFormData = {
  email: '',
  password: '',
}

function Register() {
  const [formData, setFormData] = useState(initialFormData)
  const { email, password } = formData
  const [emailErrors, setEmailErrors] = useState(null)
  const [passwordErrors, setPasswordErrors] = useState(null)
  const [tokenErrors, setTokenErrors] = useState(null)
  const captchaRef = useRef(null)

  const navigate = useNavigate()

  const handleInput = (e) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const recaptchaToken = captchaRef.current.getValue()
      captchaRef.current.reset()
      await createNewAccount({ email, password, recaptchaToken })

      setEmailErrors(null)
      setPasswordErrors(null)
      navigate('/login', { replace: true })
    } catch (error) {
      if (error?.response?.status === 422) {
        const { errors } = error.response.data
        const emailErrors = errors.filter((error) => error.email)
        const passwordErrors = errors.filter((error) => error.password)
        const tokenErrors = errors.filter((error) => error.recaptchaToken)
        if (emailErrors) setEmailErrors(emailErrors)
        if (passwordErrors) setPasswordErrors(passwordErrors)
        if (tokenErrors) setTokenErrors(tokenErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <label htmlFor="email">Email</label>
      <input value={formData.email} onInput={handleInput} type="email" name="email" id="email" required />
      {emailErrors &&
        emailErrors.map((error, i) => (
          <strong className="error" key={i}>
            {error.email}
          </strong>
        ))}

      <label htmlFor="password">Password</label>
      <input value={formData.password} onInput={handleInput} type="password" name="password" id="password" required />
      {passwordErrors &&
        passwordErrors.map((error, i) => (
          <strong className="error" key={i}>
            {error.password}
          </strong>
        ))}

      <div style={{ margin: '.5em auto' }}>
        <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA} ref={captchaRef} onChange={() => setTokenErrors(null)} />
      </div>
      {tokenErrors &&
        tokenErrors.map((error, i) => (
          <strong className="error" key={i}>
            {error.recaptchaToken}
          </strong>
        ))}

      <input type="submit" value="Register" />

      <p>Already have an account?</p>
      <Link to="/login">Login</Link>
    </form>
  )
}

export default Register
