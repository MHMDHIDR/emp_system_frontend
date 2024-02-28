import React from 'react'
import { Link } from 'react-router-dom'

export default function ErrorPage({ message }: { message?: string }) {
  return (
    <div>
      <h1>عفواً الواجهة المطلوبة غير موجودة</h1>
      {message && <p>{message}</p>}

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
