import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchAllEmployees, getEmployeeName } from '../utils/helpers'
import {
  customerCredentialsType,
  customerType,
  empType,
  getEmployeeNameType
} from '../types'
import axios from 'axios'
import { API_URL } from '../utils/constants'
import { LoadingPage } from '../components/Loading'
import HomeButton from '../components/HomeButton'

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
  const [employee_id, setEmployeeId] = useState(0)
  const [allEmployees, setAllEmployees] = useState<empType[]>([])
  //   Forms states
  const [userUpdated, setUserUpdated] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [_loading, setLoading] = useState(true)

  const { customerId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCustomerById(Number(customerId))

    // fetch all employees
    const getRepresentatives = async () => {
      const representatives = await fetchAllEmployees()

      const uniqueRepresentative =
        typeof representatives === 'object' && Array.isArray(representatives)
          ? (Array.from(
              new Set(representatives.map(representative => representative.full_name))
            )
              .map(fullName => {
                return representatives.find(
                  representative =>
                    representative.full_name === fullName &&
                    representative.role !== 'admin'
                )
              })
              .filter(representative => representative !== undefined) as empType[])
          : []

      setAllEmployees(uniqueRepresentative as empType[])
    }
    getRepresentatives()
  }, [])

  async function fetchCustomerById(id: number) {
    try {
      const { data }: { data: customerType } = await axios.get(
        `${API_URL}/customers/byId/${id}`
      )

      const { employeeName }: { employeeName: getEmployeeNameType } =
        await getEmployeeName(data?.employee_id)

      setEmployeeName(employeeName.name)
      setEmployeeId(data.employee_id)
      setLoading(employeeName.isLoading)

      setCustomersData(data)
      setCredentials(JSON.parse(String(data.customer_credentials)))
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
        howKnow,
        employee_id: employee_id || customersData?.employee_id
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

        <HomeButton />

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

            <label htmlFor='employee_id'>
              اختر الموظف المسؤول:
              <small style={{ fontSize: 10 }}>(اختياري)</small>
            </label>
            {allEmployees && allEmployees.length > 0 ? (
              <select
                id='employee_id'
                name='employee_id'
                defaultValue={
                  allEmployees.find(employee => employee.full_name === employeeName)
                    ?.employee_id
                }
                onChange={e => setEmployeeId(Number(e.target.value))}
              >
                <option value=''>اختر الموظف المسؤول</option>
                {/* the selected employee default is the customer's employee_id */}
                {allEmployees
                  .filter(employee => employee.employee_id !== customersData.id)
                  .map((employee, index) => (
                    <option key={index} value={employee.employee_id}>
                      {employee.full_name}
                    </option>
                  ))}
              </select>
            ) : (
              <small>لا يوجد مناديب بعد</small>
            )}

            <label htmlFor='credintials'>بيانات الدخول للانظمة:</label>
            <div>
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

        <Link to={`/customers/${customersData?.id}`} className='back-btn'>
          العودة
        </Link>
      </div>
    </section>
  )
}
