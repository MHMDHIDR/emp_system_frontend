import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEmployeeName } from '../utils/helpers'
import { customerCredentialsType, customerType, getEmployeeNameType } from '../types'
import axios from 'axios'
import { API_URL } from '../utils/constants'
import { LoadingPage } from '../components/Loading'

export default function CustomersEdit() {
  const [customersData, setCustomersData] = useState<customerType>()
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [job, setJob] = useState('')
  const [credentials, setCredentials] = useState<customerCredentialsType[]>()
  const [howKnow, setHowKnow] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  //   Forms states
  const [userUpdated, setUserUpdated] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [_loading, setLoading] = useState(true)

  const { customerId } = useParams()
  const navigate = useNavigate()

  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null
  }

  useEffect(() => {
    fetchCustomerById(Number(customerId))

    const empName = async () => {
      const { employeeName }: { employeeName: getEmployeeNameType } =
        await getEmployeeName(currentEmpolyee.id)

      setEmployeeName(employeeName.name)
      setLoading(employeeName.isLoading)
    }
    empName()
  }, [])

  async function fetchCustomerById(id: number) {
    try {
      const { data } = await axios.get(`${API_URL}/customers/byId/${id}`)

      setCustomersData(data)
      setCredentials(JSON.parse(data.customer_credentials))
    } catch (error: any) {
      console.error('Error fetching employee by id:', error.message)
    }
  }

  async function editCustomer(e: { preventDefault: () => void }) {
    e.preventDefault() // no refresh

    try {
      const response = await axios.patch(`${API_URL}/customers/editById/${customerId}`, {
        name,
        nationality,
        phone,
        email,
        job,
        credentials,
        howKnow
      })

      const { customer_updated, message } = await response.data

      if (customer_updated) {
        setUserUpdated(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message

        navigate('/customers')
      } else {
        setAlertMessage({ message: message, type: 'error' }) // Set error message
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل إضافة الموظف حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  const handleDelete = (index: number) => {
    // Filter out the credentials at the specified index
    const updatedCredentialsList = credentials?.filter((_, i) => i !== index)
    setCredentials(updatedCredentialsList)
  }

  const handleAddNew = () => {
    // Determine the new ID
    let newId = 1
    if (credentials && credentials.length > 0) {
      newId = credentials[credentials.length - 1].id + 1
    }

    // don't add empty credentials
    if (credentials?.some(cred => cred.websiteName === '')) {
      return
    }

    // Create a new object with website name, username, and password
    const newCredentials: customerCredentialsType = {
      id: newId, // Assign the new ID
      websiteName: '',
      username: '',
      password: ''
    }

    // Add the new credentials object to the list
    setCredentials([...(credentials || []), newCredentials])
  }

  return (
    <section>
      <div className='page-container'>
        <h2>تعديل بيانات العميل</h2>

        {!customersData ? (
          <LoadingPage />
        ) : (
          <form dir='rtl' onSubmit={editCustomer} id='customerForm'>
            <label htmlFor='name'>اسم العميل:</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='ادخل اسم العميل'
              defaultValue={customersData?.client_name}
              onChange={e => setName(e.target.value)}
              required
            />
            <label htmlFor='nationality'>الجنسية:</label>
            <input
              type='text'
              id='nationality'
              name='nationality'
              placeholder='ادخل الجنسية'
              defaultValue={customersData?.nationality}
              onChange={e => setNationality(e.target.value)}
              required
            />
            <label htmlFor='phone'>رقم التليفون:</label>
            <input
              type='text'
              id='phone'
              name='phone'
              placeholder='ادخل رقم التليفون'
              defaultValue={customersData?.phone_number}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <label htmlFor='email'>الاميل:</label>
            <input
              type='text'
              id='email'
              name='email'
              placeholder='ادخل الاميل'
              defaultValue={customersData?.email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor='job'>الوظيفة:</label>
            <input
              type='text'
              id='job'
              name='job'
              placeholder='ادخل الوظيفة'
              defaultValue={customersData?.job_title}
              onChange={e => setJob(e.target.value)}
              required
            />
            <label htmlFor='responsible'>الموظف المسئول:</label>
            <span className='data-box'>{employeeName}</span>
            <label htmlFor='credintials'>بيانات الدخول للانظمة:</label>
            <div>
              <strong>بيانات الدخول للانظمة:</strong>{' '}
              {credentials?.map((credential: customerCredentialsType, index: number) => (
                <div key={credential.id ?? '' + index}>
                  <strong>اسم الموقع:</strong>
                  <input
                    type='text'
                    defaultValue={credential.websiteName}
                    onChange={e => {
                      setCredentials(
                        [...(credentials as customerCredentialsType[])].map(
                          (cred, originalIndex) =>
                            originalIndex === index
                              ? { ...cred, websiteName: e.target.value }
                              : cred
                        )
                      )
                    }}
                  />
                  <strong>اسم المستخدم:</strong>
                  <input
                    type='text'
                    defaultValue={credential.username}
                    onChange={e => {
                      setCredentials(
                        [...(credentials as customerCredentialsType[])].map(
                          (cred, originalIndex) =>
                            originalIndex === index
                              ? { ...cred, username: e.target.value }
                              : cred
                        )
                      )
                    }}
                  />
                  <strong>كلمة المرور:</strong>
                  <input
                    type='text'
                    defaultValue={credential.password}
                    onChange={e => {
                      setCredentials(
                        [...(credentials as customerCredentialsType[])].map(
                          (cred, originalIndex) =>
                            originalIndex === index
                              ? { ...cred, password: e.target.value }
                              : cred
                        )
                      )
                    }}
                  />
                  <button onClick={() => handleDelete(index)} type='button'>
                    حذف
                  </button>
                </div>
              ))}
              <div>
                <button onClick={handleAddNew} type='button'>
                  إضافة جديدة
                </button>
              </div>
            </div>
            <label htmlFor='how_know'>كيفية التعرف علي المكتب:</label>
            <input
              type='text'
              id='how_know'
              name='how_know'
              placeholder='ادخل كيفية التعرف علي المكتب'
              defaultValue={customersData?.office_discovery_method}
              onChange={e => setHowKnow(e.target.value)}
              required
            />
            <input
              type='submit'
              value='حفظ التعديلات'
              aria-disabled={userUpdated}
              style={{ cursor: userUpdated ? 'progress' : 'pointer' }}
              disabled={userUpdated}
            />
          </form>
        )}

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}

        <Link to='/dashboard' className='back-btn'>
          العودة
        </Link>

        <div id='myModal' className='modal'>
          <div className='modal-content'>
            <span className='close'>&times;</span>
            <h3>فاتورة مثال</h3>
            <button id='downloadBtn'>تحميل كـ PDF</button>
          </div>
        </div>
      </div>
    </section>
  )
}
