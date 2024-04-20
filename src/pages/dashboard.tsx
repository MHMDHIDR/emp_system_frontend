import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../utils/constants'
import { empType } from '../types'

export default function Dashboard() {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('employee_data') || '')
    if (user) {
      const welcomeMessage = document.getElementById(
        'welcomeMessage'
      ) as HTMLHeadingElement
      welcomeMessage.textContent = `مرحبا بك ${user.full_name} في لوحة التحكم الخاصة بك`
    }

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleSignout)

    // Cleanup function to remove the event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleSignout)
    }
  }, [])

  async function handleSignout() {
    const {
      data: { emp_loggedOut }
    }: { data: { emp_loggedOut: boolean } } = await axios.patch(
      `${API_URL}/employees/logout`,
      {
        employee_id: JSON.parse(localStorage.getItem('employee_data') || '').id
      }
    )
    if (emp_loggedOut) {
      localStorage.removeItem('employee_data')
    }
  }

  const emp_type: empType['role'] =
    JSON.parse(localStorage.getItem('employee_data') || '').role ?? 'employee'

  return (
    <section>
      <div className='dashboard-container'>
        <h2 id='welcomeMessage' dir='rtl'>
          مرحبا بك في لوحة التحكم الخاصة بك
        </h2>
        <p style={{ textAlign: 'center' }}>
          هذه لوحة التحكم الخاصة بك , يمكنك اضافة العمليات هنا
        </p>

        <ul dir='rtl' className='nav-menu'>
          <li>
            <Link to='/customers'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='120'
                height='120'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-users-round'
              >
                <path d='M18 21a8 8 0 0 0-16 0' />
                <circle cx='10' cy='8' r='5' />
                <path d='M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' />
              </svg>
              <span>العملاء</span>
            </Link>
          </li>

          {(emp_type === 'admin' || emp_type === 'accountant') && (
            <>
              <li>
                <Link to='/revenues'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-calendar-clock'
                  >
                    <path d='M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5' />
                    <path d='M16 2v4' />
                    <path d='M8 2v4' />
                    <path d='M3 10h5' />
                    <path d='M17.5 17.5 16 16.3V14' />
                    <circle cx='16' cy='16' r='6' />
                  </svg>
                  <span> الايرادات </span>
                </Link>
              </li>

              <li>
                <Link to='/discharges'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-calendar-clock'
                  >
                    <path d='M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5' />
                    <path d='M16 2v4' />
                    <path d='M8 2v4' />
                    <path d='M3 10h5' />
                    <path d='M17.5 17.5 16 16.3V14' />
                    <circle cx='16' cy='16' r='6' />
                  </svg>
                  <span> المنصرفات </span>
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to='/invoices'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='120'
                height='120'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-receipt-text'
              >
                <path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z' />
                <path d='M14 8H8' />
                <path d='M16 12H8' />
                <path d='M13 16H8' />
              </svg>
              <span>الفواتير</span>
            </Link>
          </li>
          <li>
            <Link to='/services?mode=view'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='120'
                height='120'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-list-todo'
              >
                <rect x='3' y='5' width='6' height='6' rx='1' />
                <path d='m3 17 2 2 4-4' />
                <path d='M13 6h8' />
                <path d='M13 12h8' />
                <path d='M13 18h8' />
              </svg>
              <span>الخدمات</span>
            </Link>
          </li>
          {emp_type === 'admin' && (
            <>
              <li>
                <Link to='/add_emp'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-user-plus'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <line x1='19' x2='19' y1='8' y2='14' />
                    <line x1='22' x2='16' y1='11' y2='11' />
                  </svg>
                  <span>اضافة موظف</span>
                </Link>
              </li>
              <li>
                <Link to='/attendance'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-calendar-clock'
                  >
                    <path d='M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5' />
                    <path d='M16 2v4' />
                    <path d='M8 2v4' />
                    <path d='M3 10h5' />
                    <path d='M17.5 17.5 16 16.3V14' />
                    <circle cx='16' cy='16' r='6' />
                  </svg>
                  <span>الحضور والإنصارف</span>
                </Link>
              </li>
              <li>
                <Link to='/office_details'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-landmark'
                  >
                    <line x1='3' x2='21' y1='22' y2='22' />
                    <line x1='6' x2='6' y1='18' y2='11' />
                    <line x1='10' x2='10' y1='18' y2='11' />
                    <line x1='14' x2='14' y1='18' y2='11' />
                    <line x1='18' x2='18' y1='18' y2='11' />
                    <polygon points='12 2 20 7 4 7' />
                  </svg>
                  <span>تفاصيل المكتب</span>
                </Link>
              </li>
            </>
          )}
        </ul>
        <Link to='/login' className='logout-btn' onClick={handleSignout}>
          خروج
        </Link>
      </div>
    </section>
  )
}
