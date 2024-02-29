import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/constants'

export default function Login() {
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const navigate = useNavigate()

  async function loginUser(e: { preventDefault: () => void }) {
    e.preventDefault() // no refresh

    const usernameInput = document.querySelector(
      'input[name="username"]'
    ) as HTMLInputElement
    const passwordInput = document.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement

    const username = usernameInput.value
    const password = passwordInput.value

    try {
      const response = await axios.post(`${API_URL}/employees/login`, {
        username,
        password
      })

      const { id, role, full_name, login, message } = await response.data

      if (login) {
        setUserLoggedIn(true)
        localStorage.setItem('employee_data', JSON.stringify({ id, role, full_name }))

        setAlertMessage({ message: message, type: 'success' }) // Set success message
        navigate(`/dashboard`)
      } else {
        setAlertMessage({ message: message, type: 'error' }) // Set error message
      }
    } catch (error: any) {
      setAlertMessage({
        message: 'عفواً! فشل تسجيل الدخول حاول مرة أخرى!',
        type: 'error'
      })
      console.log(alertMessage.message)

      console.error('Error logging in:', error.message)
    }
  }

  return (
    <div className='login-container'>
      <h2>تسجيل الدخول</h2>
      {/* Render alert message if available */}
      {alertMessage.message && (
        <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
      )}
      <div className='login-form'>
        <form id='loginForm' onSubmit={loginUser}>
          <input
            dir='rtl'
            type='text'
            name='username'
            placeholder='اسم المستخدم'
            required
          />
          <input
            dir='rtl'
            type='password'
            name='password'
            placeholder='كلمة المرور'
            required
          />
          <input
            type='submit'
            value='دخول'
            aria-disabled={userLoggedIn}
            style={{ cursor: userLoggedIn ? 'progress' : 'pointer' }}
            disabled={userLoggedIn}
          />
        </form>
      </div>
    </div>
  )
}
