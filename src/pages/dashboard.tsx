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
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                    width='120'
                    height='120'
                    viewBox='0 0 100 100'
                    fill='none'
                  >
                    <rect width='100' height='100' fill='url(#pattern0_1_2)' />
                    <defs>
                      <pattern
                        id='pattern0_1_2'
                        patternContentUnits='objectBoundingBox'
                        width='1'
                        height='1'
                      >
                        <use xlinkHref='#image0_1_2' transform='scale(0.01)' />
                      </pattern>
                      <image
                        id='image0_1_2'
                        width='100'
                        height='100'
                        xlinkHref='data:image/png;base64,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'
                      />
                    </defs>
                  </svg>
                  <span>الايرادات</span>
                </Link>
              </li>

              <li>
                <Link to='/discharges'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                    width='110'
                    height='110'
                    viewBox='0 0 100 100'
                    fill='none'
                    style={{
                      marginBottom: '10px'
                    }}
                  >
                    <rect width='100' height='100' fill='url(#pattern0_1_4)' />
                    <defs>
                      <pattern
                        id='pattern0_1_4'
                        patternContentUnits='objectBoundingBox'
                        width='1'
                        height='1'
                      >
                        <use xlinkHref='#image0_1_4' transform='scale(0.00195312)' />
                      </pattern>
                      <image
                        id='image0_1_4'
                        width='512'
                        height='512'
                        xlinkHref='data:image/png;base64,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'
                      />
                    </defs>
                  </svg>
                  <span>المنصرفات</span>
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
                  <span>الموظفين</span>
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
