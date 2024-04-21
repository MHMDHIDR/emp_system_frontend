import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  customerType,
  empType,
  getEmployeeNameType,
  receiptsType,
  serviceType,
  subServicesType
} from '../types'
import {
  fetchAllEmployees,
  fetchCustomers,
  formatDate,
  getEmployeeName,
  getServiceData,
  onlyNumbers
} from '../utils/helpers'
import { LoadingPage } from '../components/Loading'
import { AddCustomerIcon } from '../components/Icons'
import { API_URL } from '../utils/constants'

const ServiceEdit = () => {
  const { id: serviceId } = useParams()
  const navigate = useNavigate()

  const currentEmployee = JSON.parse(localStorage.getItem('employee_data') || '{}')

  const initialFormData = {
    id: '',
    employee_id: '',
    representative_id: '',
    client_id: '',
    service_name: '',
    service_total_price: '',
    service_payment_status: '',
    service_paid_amount: '',
    service_status: '',
    created_at: '',
    ends_at: '',
    service_details: '',
    subServices: [] as subServicesType[]
  }

  const [serviceData, setServiceData] = useState<serviceType>()
  const [allClients, setAllClients] = useState<customerType[]>([])
  const [allEmployees, setAllEmployees] = useState<empType[]>([])
  const [serviceUpdated, setServiceUpdated] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [loadingName, setLoadingName] = useState(true)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [formData, setFormData] = useState(initialFormData)
  const [subServices, setSubServices] = useState<subServicesType[]>()
  const [paidAmount, setPaidAmount] = useState('')
  const serviceDataEndDateRef = useRef<HTMLInputElement>(null)

  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null,
    role: JSON.parse(localStorage.getItem('employee_data') as string).role ?? 'employee'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceData = await getServiceData(Number(serviceId))
        const service = serviceData.service
        const receipt = serviceData?.receipt as receiptsType[]

        const { employeeName }: { employeeName: getEmployeeNameType } =
          await getEmployeeName(service?.employee_id as number)

        setEmployeeName(employeeName.name)
        setLoadingName(employeeName.isLoading)
        setSubServices(JSON.parse(String(service.sub_services)))

        const getCustomers = async (page: number) => {
          const response = await fetchCustomers(currentEmpolyee.id, page)
          const customersWithEmployeeName = response?.customersWithEmployeeName

          setAllClients(
            customersWithEmployeeName?.filter((customer: customerType) =>
              currentEmployee.role === 'admin'
                ? customer
                : customer.employee_id === currentEmployee.id
            ) || []
          )
        }
        getCustomers(1)

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

        setServiceData(service)
        setFormData({
          ...initialFormData,
          service_payment_status: service?.service_payment_status ?? 'unpaid',
          service_paid_amount: String(
            receipt?.reduce(
              (acc, receipt) => Number(acc) + Number(receipt.service_paid_amount) || 0,
              0
            ) ?? 0
          ),
          ends_at: service?.ends_at ?? '',
          service_details: service?.service_details ?? ''
        })
      } catch (error: any) {
        console.error('Error fetching data:', error.message)
        setAlertMessage({
          message: 'عفواً! حدث خطأ أثناء جلب البيانات، يرجى المحاولة مرة أخرى!',
          type: 'error'
        })
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  async function editService(e: { preventDefault: () => void }) {
    e.preventDefault()

    try {
      const response = await axios.patch(
        `${API_URL}/services/editById/${Number(serviceId)}`,
        { formData, paidAmount, subServices }
      )

      const { service_updated, message } = await response.data

      if (service_updated) {
        setServiceUpdated(true)
        setAlertMessage({ message: message, type: 'success' })
        navigate(`/service/${serviceId}`)
      } else {
        setAlertMessage({ message: message, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error editing service:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل تعديل الخدمة، يرجى المحاولة مرة أخرى!',
        type: 'error'
      })
    }
  }

  const handleDelete = (index: number) => {
    // Filter out the subServices at the specified index
    const updatedSubServicesList = subServices?.filter((_, i) => i !== index)
    setSubServices(updatedSubServicesList)
  }

  const handleAddNew = () => {
    // Determine the new ID
    let newId = 1
    if (subServices && subServices.length > 0) {
      newId = subServices[subServices.length - 1].id + 1
    }

    // don't add empty subServices
    if (subServices?.some(cred => cred.service_details === '')) {
      return
    }

    // Create a new object with website name, username, and password
    const initialSubService: subServicesType = {
      id: newId,
      service_details: '',
      service_date: ''
    }

    // Add the new subServices object to the list
    setSubServices([...(subServices || []), initialSubService])
  }

  useEffect(() => {
    if (
      serviceDataEndDateRef.current &&
      subServices?.length &&
      subServices[0].service_date
    ) {
      serviceDataEndDateRef.current.value = formData.ends_at
      setFormData({ ...formData, ends_at: formData.ends_at })
    }
  }, [subServices])

  return (
    <section>
      <div className='page-container'>
        <h2>تعديل الخدمة</h2>

        {!serviceData || loadingName ? (
          <LoadingPage />
        ) : (
          <form dir='rtl' onSubmit={editService}>
            <label htmlFor='employee_id'>الموظف:</label>
            <span className='data-box'>{employeeName}</span>
            <label htmlFor='client_id'>العميل:</label>
            {allClients && allClients.length > 0 ? (
              <select
                id='client_id'
                name='client_id'
                defaultValue={serviceData?.client_id ? serviceData.client_id : ''}
                onChange={e => {
                  setFormData({ ...formData, client_id: e.target.value })
                }}
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
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
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
                onChange={handleChange}
                defaultValue={
                  serviceData?.representative_id ? serviceData?.representative_id : ''
                }
              >
                <option value='0'>اختر المندوب</option>
                {allEmployees
                  .filter(employee => employee.employee_id !== currentEmployee.id)
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
              defaultValue={serviceData?.service_name}
              onChange={handleChange}
              required
            />
            <label htmlFor='service_total_price'>سعر الخدمة:</label>
            <input
              type='text'
              id='service_total_price'
              name='service_total_price'
              placeholder='ادخل سعر الخدمة'
              onChange={handleChange}
              onKeyDown={onlyNumbers}
              defaultValue={serviceData ? serviceData.service_total_price : ''}
              required
            />
            <label htmlFor='service_payment_status'>حالة الدفع:</label>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                direction: 'ltr'
              }}
            >
              <label style={{ cursor: 'pointer' }} htmlFor='unpaid'>
                غير مدفوعة
              </label>
              <input
                type='radio'
                id='unpaid'
                name='service_payment_status'
                value='unpaid'
                onChange={() => {
                  setFormData({
                    ...formData,
                    service_payment_status: 'unpaid'
                  })
                }}
                defaultChecked={serviceData?.service_payment_status === 'unpaid'}
                disabled={
                  serviceData?.service_total_price ===
                  Number(formData.service_paid_amount)
                }
              />

              <label style={{ cursor: 'pointer' }} htmlFor='partially-paid'>
                مدفوعة جزئياً
              </label>
              <input
                type='radio'
                id='partially-paid'
                name='service_payment_status'
                value='partially-paid'
                onChange={() => {
                  setFormData({
                    ...formData,
                    service_payment_status: 'partially-paid'
                  })
                }}
                defaultChecked={serviceData?.service_payment_status === 'partially-paid'}
                disabled={
                  serviceData?.service_total_price ===
                  Number(formData.service_paid_amount)
                }
              />

              <label style={{ cursor: 'pointer' }} htmlFor='paid'>
                مدفوعة كاملاً
              </label>
              <input
                type='radio'
                id='paid'
                name='service_payment_status'
                value='paid'
                onChange={() => {
                  setFormData({
                    ...formData,
                    service_payment_status: 'paid'
                  })
                }}
                defaultChecked={
                  serviceData?.service_payment_status === 'paid' ||
                  serviceData?.service_total_price ===
                    Number(formData.service_paid_amount)
                }
              />
            </div>
            {formData.service_payment_status === 'partially-paid' && (
              <>
                <label htmlFor='service_paid_amount'>المبلغ المدفوع الجديد:</label>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  min='0'
                  max={serviceData?.service_total_price}
                  id='service_paid_amount'
                  name='service_paid_amount'
                  placeholder={'المبلغ المدفوع'}
                  aria-placeholder={formData.service_paid_amount}
                  onChange={e => {
                    setPaidAmount(e.target.value)
                  }}
                  onKeyDown={onlyNumbers}
                  required={false}
                />
                <span>{`المبلغ المدفوع حتى الآن: ${formData.service_paid_amount} درهم`}</span>
              </>
            )}

            <label htmlFor='service_status'>حالة الخدمة</label>
            <select
              name='service_status'
              id='service_status'
              onChange={handleChange}
              defaultValue={serviceData?.service_status}
              required
            >
              <option value='not-started'>لم تبدأ بعد</option>
              <option value='in-process'>قيد الاجراء</option>
              <option value='completed'>اكتملت</option>
            </select>

            <label htmlFor='created_at'>تاريخ الإنشاء:</label>
            <input
              type='date'
              id='created_at'
              name='created_at'
              defaultValue={serviceData ? formatDate(serviceData.created_at) : ''}
              onChange={handleChange}
              required
            />
            <label htmlFor='ends_at'>تاريخ الانتهاء:</label>
            <input
              type='date'
              id='ends_at'
              name='ends_at'
              ref={serviceDataEndDateRef}
              defaultValue={serviceData ? formatDate(serviceData.ends_at) : ''}
              onChange={handleChange}
              required
            />
            <label htmlFor='service_details'>تفاصيل الخدمة:</label>
            <textarea
              id='service_details'
              name='service_details'
              onChange={handleChange}
              defaultValue={serviceData?.service_details}
              style={{ resize: 'vertical', minHeight: '100px' }}
              placeholder='ادخل تفاصيل الخدمة'
              required
            ></textarea>
            <label htmlFor='subServices'>المهام الفرعية :</label>
            <div>
              {subServices?.map((subService: subServicesType, index: number) => (
                <div key={subService.id ?? '' + index}>
                  <strong>التاريخ:</strong>
                  <input
                    type='date'
                    defaultValue={subService.service_date}
                    onChange={e => {
                      setSubServices(
                        [...(subServices as subServicesType[])].map(
                          (cred, originalIndex) =>
                            originalIndex === index
                              ? { ...cred, service_date: e.target.value }
                              : cred
                        )
                      )

                      if (index === subServices.length - 1) {
                        setFormData({ ...formData, ends_at: e.target.value })
                        setServiceData({
                          ...serviceData,
                          ends_at: e.target.value
                        })
                      }
                    }}
                  />
                  <strong>وصف المهمة:</strong>
                  <textarea
                    defaultValue={subService.service_details}
                    onChange={e => {
                      setSubServices(
                        [...(subServices as subServicesType[])].map(
                          (cred, originalIndex) =>
                            originalIndex === index
                              ? { ...cred, service_details: e.target.value }
                              : cred
                        )
                      )
                    }}
                  ></textarea>
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
            <button type='submit' aria-disabled={serviceUpdated}>
              حفظ التغييرات
            </button>
          </form>
        )}

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}

        <Link to={`/services/${serviceData?.client_id}?mode=view`} className='back-btn'>
          العودة إلى قائمة الخدمات
        </Link>
      </div>
    </section>
  )
}

export default ServiceEdit
