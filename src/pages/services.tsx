import React, { useState, useEffect, SetStateAction } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { customerType, empType, serviceModeType, serviceType } from '../types'
import axios from 'axios'
import { API_URL, ITEMS_PER_PAGE } from '../utils/constants'
import {
  arabicDate,
  fetchAllEmployees,
  fetchCustomers,
  fetchServices,
  onlyNumbers
} from '../utils/helpers'
import { AddIcon, AddCustomerIcon } from '../components/Icons'
import HomeButton from '../components/HomeButton'
import { Pagination } from '../components/Pagination'

const englishToArabicNumbers = (englishNumber: string) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return englishNumber.replace(/[0-9]/g, (match: any) => {
    return arabicNumbers[match]
  })
}

const Services = () => {
  const { customerId } = useParams()
  const { search } = useLocation()
  const mode = new URLSearchParams(search).get('mode') as serviceModeType
  const customer_Id = new URLSearchParams(search).get('customerId')

  const [searchEndDate, setSearchEndDate] = useState('')

  const handleEndDateSearch = (e: { target: { value: SetStateAction<string> } }) => {
    setSearchEndDate(englishToArabicNumbers(String(e.target.value))) // Convert entered numbers to Arabic
  }

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // Fetch services based on searchEndDate
    const fetchServicesByEndDate = async () => {
      const { servicesForCurrentEmployee } = await fetchServices(currentPage, {
        customerId: Number(customerId)
      })

      let filteredServices = servicesForCurrentEmployee || []

      if (searchEndDate) {
        filteredServices = filteredServices.filter(service => {
          const arabicEndDate = arabicDate(service.ends_at) // Convert end-of-service date to Arabic
          return arabicEndDate.includes(searchEndDate) // Search for Arabic month name in end-of-service date
        })
      }

      setServices(filteredServices)
    }

    fetchServicesByEndDate()
  }, [searchEndDate, customerId, currentPage])

  const getServiceRowColor = (service: {
    ends_at: string | number | Date
    service_status: string
  }) => {
    const endDate = new Date(service.ends_at)
    const today = new Date()
    const oneDayAhead = new Date(today)
    oneDayAhead.setDate(oneDayAhead.getDate() + 1) // Calculate one day ahead

    if (endDate < today && service.service_status === 'not-started') {
      return '#cf5555' // End date passed and service not started
    } else if (endDate < today && service.service_status === 'in-process') {
      return 'orange' // End date passed and service in process
    } else if (service.service_status === 'completed') {
      return 'green' // End date passed and service completed
    } else if (endDate.getTime() === oneDayAhead.getTime()) {
      return 'gray' // One day ahead
    } else {
      const oneDayDifference =
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      if (oneDayDifference <= 1 && oneDayDifference > 0) {
        return 'gray' // One day remaining
      } else {
        return '' // Default color
      }
    }
  }

  const today = new Date().toISOString().split('T')[0] // Today's current date

  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null,
    role: JSON.parse(localStorage.getItem('employee_data') as string).role ?? 'employee'
  }

  const getStatusTranslation = (status: any) => {
    switch (status) {
      case 'not-started':
        return 'لم تبدأ بعد'
      case 'in-process':
        return 'تحت الاجراء'
      default:
        return 'اكتملت'
    }
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
    service_details: '',
    service_status: ''
  })
  const [searchServiceStatus, setSearchServiceStatus] = useState<string>('')
  const [searchPaymentStatus, setSearchPaymentStatus] = useState<string>('')
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [serviceAdded, setServiceAdded] = useState(false)
  const [serviceDeleted, setServiceDeleted] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const getCustomers = async () => {
    const response = await fetchCustomers()
    const customersWithEmployeeName = response?.customersWithEmployeeName

    setAllClients(
      customersWithEmployeeName?.filter((customer: customerType) =>
        currentEmpolyee.role === 'admin'
          ? customer
          : customer.employee_id === currentEmpolyee.id
      ) || []
    )
  }

  const getAllServices = async (page: number) => {
    const { servicesForCurrentEmployee, totalServices } = await fetchServices(page, {
      customerId: Number(customerId)
    })

    setServices(
      servicesForCurrentEmployee?.filter((service: serviceType) =>
        currentEmpolyee.role === 'admin'
          ? service
          : service.employee_id === currentEmpolyee.id
      ) || []
    )
    setTotalPages(Math.ceil((totalServices as number) / ITEMS_PER_PAGE))
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
        message: 'عفواً! فشل حذف الخدمة حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  useEffect(() => {
    const getAllServices = async () => {
      const { servicesForCurrentEmployee } = await fetchServices(currentPage, {
        customerId: Number(customerId)
      })

      let filteredServices = servicesForCurrentEmployee || []

      if (searchServiceStatus) {
        filteredServices = filteredServices.filter((service: serviceType) => {
          return service.service_status === searchServiceStatus
        })
      }

      if (searchPaymentStatus) {
        filteredServices = filteredServices.filter((service: serviceType) => {
          return service.service_payment_status === searchPaymentStatus
        })
      }

      setServices(filteredServices)
    }

    getAllServices()
  }, [searchServiceStatus, searchPaymentStatus, customerId, currentPage])

  useEffect(() => {
    const allServices = async () => await getAllServices(currentPage)
    allServices()
  }, [serviceAdded, serviceDeleted, currentPage])

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

  useEffect(() => {
    setFormData({ ...formData, client_id: customer_Id || '' })
  }, [customer_Id])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    getAllServices(page)
  }

  return (
    <section>
      <div className='page-container'>
        <h2>قائمة الخدمات</h2>

        {/* Form for adding a service */}
        {mode === 'add' && (
          <>
            <form dir='rtl' onSubmit={addService}>
              <label>الموظف:</label>
              <span className='data-box'>{currentEmpolyee.name}</span>

              <label htmlFor='client_id'>العميل:</label>
              {allClients && allClients.length > 0 ? (
                <>
                  <span className='data-box'>
                    {allClients
                      .filter(client => client.id === Number(customer_Id))
                      .map((client, index) => (
                        <option key={index} value={client.id}>
                          {client.client_name}
                        </option>
                      ))}
                  </span>
                </>
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
                type='text'
                id='service_total_price'
                name='service_total_price'
                placeholder='ادخل سعر الخدمة'
                value={formData.service_total_price}
                onChange={handleChange}
                onKeyDown={onlyNumbers}
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
          {customerId && (
            <Link
              to={`/services?mode=add&customerId=${customerId}`}
              className='back-btn'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                width: 'fit-content',
                marginLeft: 'auto',
                marginBottom: '10px'
              }}
            >
              إضافة خدمة جديدة
              <AddIcon />
            </Link>
          )}

          {mode === 'view' && (
            <>
              <form dir='rtl' className='page-container-small'>
                <label htmlFor='searchEndDate'>البحث بتاريخ انتهاء الخدمة:</label>
                <input
                  type='text'
                  id='searchEndDate'
                  value={searchEndDate}
                  onChange={handleEndDateSearch}
                  placeholder='ادخل تاريخ انتهاء الخدمة'
                />
                <label htmlFor='searchServiceStatus'>حالة الخدمة:</label>
                <select
                  id='searchServiceStatus'
                  value={searchServiceStatus}
                  onChange={e => setSearchServiceStatus(e.target.value)}
                >
                  <option value=''>الكل</option>
                  <option value='not-started'>لم تبدأ بعد</option>
                  <option value='in-process'>تحت الاجراء</option>
                  <option value='completed'>اكتملت</option>
                </select>

                <label htmlFor='searchPaymentStatus'>حالة الدفع:</label>
                <select
                  id='searchPaymentStatus'
                  value={searchPaymentStatus}
                  onChange={e => setSearchPaymentStatus(e.target.value)}
                >
                  <option value=''>الكل</option>
                  <option value='paid'>مدفوعة</option>
                  <option value='partially-paid'>مدفوعة جزئياً</option>
                  <option value='unpaid'>غير مدفوعة</option>
                </select>
              </form>

              <HomeButton />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />

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
                    <th>حالة الخدمة</th>
                    <th>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {!allServices || allServices.length === 0 ? (
                    <tr>
                      <td colSpan={12}>لا يوجد خدمات</td>
                    </tr>
                  ) : (
                    allServices
                      .filter((service: serviceType) =>
                        currentEmpolyee.role === 'admin'
                          ? service
                          : service.employee_id === currentEmpolyee.id
                      )
                      .map((service, index) => (
                        <tr
                          key={index}
                          style={{ backgroundColor: getServiceRowColor(service) }}
                        >
                          <td>{service.id}</td>
                          <td>
                            <span>
                              {service.employeeName && service.employeeName.name}
                            </span>
                          </td>
                          <td>
                            {
                              allClients.filter(
                                client => client.id === service.client_id
                              )[0]?.client_name
                            }
                          </td>
                          <td>
                            {
                              <span>
                                {service.representativeName &&
                                  service.representativeName.name}
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
                                      Number(acc) + Number(receipt.service_paid_amount) ||
                                      0,
                                    0
                                  ) // Sum of all receipts
                                : 'لا يوجد' // If there are no receipts
                            }
                          </td>
                          <td>{arabicDate(service.created_at)}</td>
                          <td>{arabicDate(service.ends_at)}</td>
                          <td>{service.service_details}</td>
                          <td>{getStatusTranslation(service.service_status)}</td>
                          <td>
                            {/* Buttons for updating and deleting */}
                            <Link
                              style={{ margin: 10 }}
                              to={`/service/${service.id}`}
                              className='back-btn'
                            >
                              تحديث الخدمة
                            </Link>
                            {currentEmpolyee.role === 'admin' && (
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
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {/* Link to navigate back to customers page */}
        <Link to={customerId ? `/customers` : `/dashboard`} className='back-btn'>
          العودة
        </Link>
      </div>
    </section>
  )
}

export default Services
