import React from 'react'
import { Link } from 'react-router-dom'

export const LoadingPage = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#E5E9F0'
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '40%',
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: '#1A365D',
        borderRadius: '50%',
        animation: 'bounce 1s infinite'
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: '#1A365D',
        borderRadius: '50%',
        animation: 'bounce 1s infinite',
        animationDelay: '100ms'
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '60%',
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: '#1A365D',
        borderRadius: '50%',
        animation: 'bounce 1s infinite',
        animationDelay: '200ms'
      }}
    />
    <span
      style={{
        marginTop: '7rem',
        color: '#1A365D',
        direction: 'rtl'
      }}
    >
      <strong>جاري التحميل...</strong>

      <br />

      <Link to={'/'} className='back-btn'>
        لوحة التحكم
      </Link>
    </span>
  </div>
)
