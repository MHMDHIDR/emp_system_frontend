import React, { Suspense, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/constants'
import axios from 'axios'
import type { customerType, getEmployeeNameType, customerCredentialsType } from '../types'
import { arabicDate, fetchCustomers } from '../utils/helpers'

export default function Customers() {
  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null,
    role: JSON.parse(localStorage.getItem('employee_data') as string).role ?? 'employee'
  }

  const [websiteName, setWebsiteName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credentialsList, setCredentialsList] = useState<customerCredentialsType[]>([])
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [job, setJob] = useState('')
  const [how_know, setHowKnow] = useState('')
  const [customerAdded, setCustomerAdded] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [employeeNameResult, setEmployeeNameResult] =
    useState<getEmployeeNameType | null>({ name: '', isLoading: true })
  const [allClients, setAllClients] = useState<customerType[]>([])

  const navigate = useNavigate()

  const handleDelete = (index: number) => {
    const updatedCredentialsList = credentialsList.filter((_, i) => i !== index)
    setCredentialsList(updatedCredentialsList)
  }

  const handleAddNew = () => {
    if (!websiteName || !username || !password) return
    const newCredentials: customerCredentialsType = {
      id: credentialsList.length + 1,
      websiteName,
      username,
      password
    }
    setCredentialsList([...credentialsList, newCredentials])
    setWebsiteName('')
    setUsername('')
    setPassword('')
  }

  const addCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${API_URL}/customers/addCustomer`, {
        name,
        nationality,
        phone,
        email,
        job,
        how_know,
        emp_added: currentEmpolyee.id,
        credentialsList
      })

      const { customer_added, message } = await response.data

      if (customer_added) {
        setCustomerAdded(true)
        setAlertMessage({ message: message, type: 'success' })
        navigate('/customers')
      } else {
        setAlertMessage({ message: message, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: error?.response.data.message ?? 'عفواً! فشل إضافة العميل حاول مرة أخرى!',
        type: 'error'
      })
    } finally {
      setCustomerAdded(false)
    }
  }

  const getCustomers = async () => {
    const { customersWithEmployeeName } = await fetchCustomers()

    setAllClients(
      customersWithEmployeeName?.filter((customer: customerType) =>
        currentEmpolyee.role === 'admin'
          ? customer
          : customer.employee_id === currentEmpolyee.id
      ) || []
    )
  }

  useEffect(() => {
    const allCustomers = async () => await getCustomers()
    allCustomers()
  }, [customerAdded])

  useEffect(() => {
    const empName = async () => {
      setEmployeeNameResult({ name: '', isLoading: false })
    }
    empName()
  }, [])

  async function deleteCustomer(empId: number) {
    try {
      const response = await axios.delete(`${API_URL}/customers/delete_customer/${empId}`)
      const { customer_deleted, message } = await response?.data
      if (customer_deleted) {
        setAlertMessage({ message: message, type: 'success' })
        await getCustomers()
      } else {
        setAlertMessage({ message: message, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل حذف العميل حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  const emp_type =
    JSON.parse(localStorage.getItem('employee_data') || '').role ?? 'employee'

  return (
    <section>
      <div className='page-container'>
        <h2>قائمة العملاء</h2>

        <form dir='rtl' onSubmit={addCustomer}>
          <label htmlFor='name'>اسم العميل:</label>
          <input
            type='text'
            id='name'
            name='name'
            placeholder='ادخل اسم العميل'
            onChange={e => setName(e.target.value)}
            required
          />
          <label htmlFor='nationality'>الجنسية:</label>
          <input
            type='text'
            id='nationality'
            name='nationality'
            placeholder='ادخل الجنسية'
            onChange={e => setNationality(e.target.value)}
            required
          />
          <label htmlFor='phone'>رقم التليفون:</label>
          <input
            type='number'
            id='phone'
            name='phone'
            placeholder='ادخل رقم التليفون'
            onChange={e => setPhone(e.target.value)}
            required
          />
          <label htmlFor='email'>البريد الالكتروني:</label>
          <input
            type='email'
            id='email'
            name='email'
            placeholder='ادخل الاميل'
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor='job'>الوظيفة:</label>
          <input
            type='text'
            id='job'
            name='job'
            placeholder='ادخل الوظيفة'
            onChange={e => setJob(e.target.value)}
            required
          />
          <label htmlFor='responsible'>الموظف المسئول:</label>
          <span className='data-box'>{currentEmpolyee.name}</span>
          <label htmlFor='how_know'>كيفية التعرف علي المكتب:</label>
          <input
            type='text'
            id='how_know'
            name='how_know'
            placeholder='ادخل كيفية التعرف علي المكتب'
            onChange={e => setHowKnow(e.target.value)}
            required
          />

          <div>
            <div>
              <input
                type='text'
                placeholder='Website Name'
                value={websiteName}
                onChange={e => setWebsiteName(e.target.value)}
              />
              <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div>
                {credentialsList.map((credentials, index) => (
                  <div key={index}>
                    <p>إســـــــم الموقع: {credentials.websiteName}</p>
                    <p>إســم المستخدم: {credentials.username}</p>
                    <p>كلـــمة المــــرور: {credentials.password}</p>
                    <button onClick={() => handleDelete(index)}>حذف</button>
                  </div>
                ))}
              </div>
              <button onClick={handleAddNew} type='button'>
                إضافة جديدة
              </button>
            </div>
          </div>

          <input type='submit' value='إضافة عميل جديد' />
        </form>

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}

        {allClients && allClients.length > 0 && (
          <div className='table-container'>
            <table dir='rtl'>
              <thead>
                <tr>
                  <th>التسلسل</th>
                  <th>التاريخ الادخال</th>
                  <th>اسم العميل</th>
                  <th>الجنسية</th>
                  <th>رقم التليفون</th>
                  <th>البريد الالكتروني</th>
                  <th>الوظيفة</th>
                  <th>اسم المستخدم وكلمات المرور</th>
                  <th>الموظف المسئول</th>
                  <th>كيفية التعرف علي المكتب</th>
                  <th>الخدمات</th>
                  <th>الفواتير</th>
                  <th>عمليات</th>
                </tr>
              </thead>
              <tbody>
                {allClients.map((client, index: number) => (
                  <tr key={index}>
                    <td>{client.id}</td>
                    <td>{arabicDate(client.created_at)}</td>
                    <td>{client.client_name}</td>
                    <td>{client.nationality}</td>
                    <td>{client.phone_number}</td>
                    <td>{client.email}</td>
                    <td>{client.job_title}</td>
                    <td>
                      {client.customer_credentials &&
                      JSON.parse(String(client.customer_credentials)).length > 0 ? (
                        <div style={{ whiteSpace: 'nowrap' }}>
                          {JSON.parse(String(client.customer_credentials)).map(
                            (credentials: customerCredentialsType, index: number) => (
                              <div
                                key={index}
                                style={{
                                  display: 'inline-block',
                                  marginRight: '10px'
                                }}
                              >
                                <p>إســـــــم الموقع: {credentials.websiteName}</p>
                                <p>إســم المستخدم: {credentials.username}</p>
                                <p>كلـــمة المــــرور: {credentials.password}</p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        'لا يوجد بيانات'
                      )}
                    </td>

                    <td>
                      <Suspense
                        fallback={(employeeNameResult?.isLoading ?? true) && 'Loading...'}
                      >
                        <span>{client.employeeName && client.employeeName.name}</span>
                      </Suspense>
                    </td>
                    <td>{client.office_discovery_method}</td>
                    <td>
                      <Link to={`/services/${client.id}`} className='back-btn'>
                        الخدمات
                      </Link>
                    </td>
                    <td>
                      <Link to={`/invoices/${client.id}`} className='back-btn'>
                        الفواتير
                      </Link>
                    </td>
                    <td>
                      <Link
                        style={{ margin: 10 }}
                        to={`/customers/${client.id}`}
                        className='back-btn'
                      >
                        عرض بيانات العميل
                      </Link>
                      {emp_type === 'admin' && (
                        <button
                          style={{ margin: 10 }}
                          onClick={() => {
                            confirm(
                              'هل أنت متأكد من حذف العميل؟ لا يمكن التراجع عن هذا القرار.'
                            ) && deleteCustomer(client.id)
                          }}
                          className='logout-btn'
                        >
                          حذف العميل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
