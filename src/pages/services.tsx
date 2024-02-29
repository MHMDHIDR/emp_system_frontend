import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { customerType, empType, serviceType } from '../types'
import axios from 'axios'
import { API_URL } from '../utils/constants'
import {
  arabicDate,
  fetchAllEmployees,
  fetchCustomers,
  fetchServices
} from '../utils/helpers'
import { AddIcon, AddCustomerIcon } from '../components/Icons'

const Services = () => {
  const { customerId } = useParams()
  const today = new Date().toISOString().split('T')[0] // Today's current date

  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null,
    role: JSON.parse(localStorage.getItem('employee_data') as string).role ?? 'employee'
  }

  const [allClients, setAllClients] = useState<customerType[]>([])
  const [allServices, setServices] = useState<serviceType[]>([])
  const [allEmployees, setAllEmployees] = useState<empType[]>([])
  const [formData, setFormData] = useState({
    employee_id: currentEmpolyee.id,
    representative_id: '',
    client_id: '',
    service_name: '',
    service_total_price: '',
    created_at: today,
    ends_at: '',
    service_details: ''
  })
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [serviceAdded, setServiceAdded] = useState(false)
  const [serviceDeleted, setServiceDeleted] = useState(false)

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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

  const getAllServices = async () => {
    const { servicesForCurrentEmployee } = await fetchServices({
      customerId: Number(customerId)
    })

    setServices(
      servicesForCurrentEmployee?.filter((service: serviceType) =>
        currentEmpolyee.role === 'admin'
          ? service
          : service.employee_id === currentEmpolyee.id
      ) || []
    )
  }

  const addService = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    const startDate = new Date(formData.created_at).toISOString().split('T')[0]
    const startDateToSend =
      startDate !== today ? startDate : new Date().toISOString().split('T')[0]

    try {
      const response = await axios.post(`${API_URL}/services/addService`, {
        ...formData,
        created_at: startDateToSend
      })

      const { service_added, message } = await response.data

      if (service_added) {
        setServiceAdded(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message
      } else {
        setAlertMessage({ message: message, type: 'error' }) // Set error message
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: error?.response.data.message ?? 'عفواً! فشل إضافة الخدمة حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  async function deleteService(serviceId: number) {
    try {
      const response = await axios.delete(
        `${API_URL}/services/delete_service/${serviceId}`
      )
      const { service_deleted, message } = await response.data
      if (service_deleted) {
        setAlertMessage({ message: message, type: 'success' }) // Set success message
        setServiceDeleted(true)
      } else {
        setAlertMessage({ message: message, type: 'error' }) // Set error message
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل حذف العميل حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  useEffect(() => {
    const allServices = async () => await getAllServices()
    allServices()
  }, [serviceAdded, serviceDeleted])

  useEffect(() => {
    getCustomers()
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

  return (
    <section>
      <div className='page-container'>
        <h2>قائمة الخدمات</h2>

        {/* Form for adding a service */}
        {!customerId && (
          <>
            <form dir='rtl' onSubmit={addService}>
              <label>الموظف:</label>
              <span className='data-box'>{currentEmpolyee.name}</span>

              <label htmlFor='client_id'>العميل:</label>
              {allClients && allClients.length > 0 ? (
                <select
                  id='client_id'
                  name='client_id'
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                >
                  <option value=''>اختر العميل</option>
                  {allClients.map((client, index) => (
                    <option key={index} value={client.id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <small>لا يوجد عملاء</small>
                  <Link
                    to='/customers'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <AddCustomerIcon />
                    إضافة عميل جديد
                  </Link>
                </>
              )}

              <label htmlFor='representative_id'>
                اختر المندوب:
                <small style={{ fontSize: 10 }}>(اختياري)</small>
              </label>
              {allEmployees && allEmployees.length > 0 ? (
                <select
                  id='representative_id'
                  name='representative_id'
                  defaultValue={formData.representative_id}
                  onChange={handleChange}
                >
                  <option value=''>اختر المندوب</option>
                  {allEmployees
                    .filter(employee => employee.employee_id !== currentEmpolyee.id)
                    .map((employee, index) => (
                      <option key={index} value={employee.employee_id}>
                        {employee.full_name}
                      </option>
                    ))}
                </select>
              ) : (
                <small>لا يوجد مناديب بعد</small>
              )}

              <label htmlFor='service_name'>اسم الخدمة:</label>
              <input
                type='text'
                id='service_name'
                name='service_name'
                placeholder='ادخل اسم الخدمة'
                value={formData.service_name}
                onChange={handleChange}
                required
              />

              <label htmlFor='service_total_price'>سعر الخدمة:</label>
              <input
                type='number'
                inputMode='numeric'
                pattern='[0-9]*'
                id='service_total_price'
                name='service_total_price'
                placeholder='ادخل سعر الخدمة'
                value={formData.service_total_price}
                onChange={handleChange}
                required
              />

              <label htmlFor='created_at'>تاريخ بداية الخدمة:</label>
              <input
                type='date'
                id='created_at'
                name='created_at'
                value={formData.created_at}
                onChange={handleChange}
                required
              />

              <label htmlFor='ends_at'>تاريخ الانتهاء:</label>
              <input
                type='date'
                id='ends_at'
                name='ends_at'
                value={formData.ends_at}
                onChange={handleChange}
                required
              />

              <label htmlFor='service_details'>تفاصيل الخدمة:</label>
              <textarea
                id='service_details'
                name='service_details'
                value={formData.service_details}
                onChange={handleChange}
                style={{ resize: 'vertical', minHeight: '100px' }}
                placeholder='ادخل تفاصيل الخدمة'
                required
              ></textarea>
              <button type='submit' disabled={serviceAdded}>
                إضافة خدمة جديدة
              </button>
            </form>
            {alertMessage.message && (
              <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
            )}
          </>
        )}

        <div className='table-container'>
          <table dir='rtl'>
            <thead>
              <tr>
                <th>التسلسل</th>
                <th>الموظف</th>
                <th>العميل</th>
                <th>المندوب</th>
                <th>اسم الخدمة</th>
                <th>سعر الخدمة</th>
                <th>حالة الدفع</th>
                <th>المبلغ المدفوع</th>
                <th>تاريخ الإنشاء</th>
                <th>تاريخ الانتهاء</th>
                <th>تفاصيل الخدمة</th>
                <th>العمليات</th>
              </tr>
            </thead>
            <tbody>
              {!allServices || allServices.length === 0 ? (
                <tr>
                  <td colSpan={12}>
                    لا يوجد خدمات
                    <br />
                    <Link
                      to='/services'
                      className='back-btn'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <AddIcon />
                      إضافة خدمة جديدة
                    </Link>
                  </td>
                </tr>
              ) : (
                allServices.map((service, index) => (
                  <tr key={index}>
                    <td>{service.id}</td>
                    <td>
                      <span>{service.employeeName && service.employeeName.name}</span>
                    </td>
                    <td>
                      {
                        allClients.filter(client => client.id === service.client_id)[0]
                          ?.client_name
                      }
                    </td>
                    <td>
                      {
                        <span>
                          {service.representativeName && service.representativeName.name}
                        </span>
                      }
                    </td>
                    <td>{service.service_name}</td>
                    <td>{service.service_total_price}</td>
                    <td>
                      {service.service_payment_status === 'paid'
                        ? 'مدفوعة'
                        : service.service_payment_status === 'partially-paid'
                        ? 'مدفوعة جزئياً'
                        : 'غير مدفوعة'}
                    </td>
                    <td>
                      {
                        service.receipts.length > 0 // If there are receipts
                          ? service.receipts.reduce(
                              (acc, receipt) =>
                                Number(acc) + Number(receipt.service_paid_amount) || 0,
                              0
                            ) // Sum of all receipts
                          : 'لا يوجد' // If there are no receipts
                      }
                    </td>
                    <td>{arabicDate(service.created_at)}</td>
                    <td>{arabicDate(service.ends_at)}</td>
                    <td>{service.service_details}</td>
                    <td>
                      {/* Buttons for updating and deleting */}
                      <Link
                        style={{ margin: 10 }}
                        to={`/service/${service.id}`}
                        className='back-btn'
                      >
                        تحديث الخدمة
                      </Link>
                      <button
                        style={{ margin: 10 }}
                        onClick={() => {
                          confirm(
                            'هل أنت متأكد من حذف الخدمة؟ لا يمكن التراجع عن هذا القرار.'
                          ) && deleteService(service.id)
                        }}
                        className='delete-btn'
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Link to navigate back to customers page */}
        <Link to='/dashboard' className='back-btn'>
          العودة
        </Link>
      </div>
    </section>
  )
}

export default Services
