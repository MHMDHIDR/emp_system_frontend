import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  customerType,
  empType,
  getEmployeeNameType,
  receiptsType,
  serviceType
} from '../types'
import {
  fetchAllEmployees,
  fetchCustomers,
  formatDate,
  getEmployeeName,
  getServiceData
} from '../utils/helpers'
import { LoadingPage } from '../components/Loading'
import { AddCustomerIcon } from '../components/Icons'
import { API_URL } from '../utils/constants'
import axios from 'axios'

const ServiceEdit = () => {
  const { id: serviceId } = useParams()
  const navigate = useNavigate()

  const currentEmpolyee = {
    name: JSON.parse(localStorage.getItem('employee_data') as string).full_name ?? null,
    id: Number(JSON.parse(localStorage.getItem('employee_data') as string).id) ?? null,
    role: JSON.parse(localStorage.getItem('employee_data') as string).role ?? 'employee'
  }

  const [serviceData, setServiceData] = useState<serviceType>()
  const [allClients, setAllClients] = useState<customerType[]>([])
  const [allEmployees, setAllEmployees] = useState<empType[]>([])
  const [serviceUpdated, setServiceUpdated] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [loadingName, setLoadingName] = useState(true)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [formData, setFormData] = useState({
    id: '',
    employee_id: '',
    representative_id: '',
    client_id: '',
    service_name: '',
    service_total_price: '',
    service_payment_status: '',
    service_paid_amount: '',
    created_at: '',
    ends_at: '',
    service_details: ''
  })

  useEffect(() => {
    // العملاء
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
    getCustomers()
    // الخدمات
    const getService = async () => {
      const serviceData = await getServiceData(Number(serviceId))
      const service = serviceData?.service
      const receipt = serviceData?.receipt as receiptsType[]

      const { employeeName }: { employeeName: getEmployeeNameType } =
        await getEmployeeName(service?.employee_id as number)

      setEmployeeName(employeeName.name)
      setLoadingName(employeeName.isLoading)

      setServiceData(service)
      setFormData({
        ...formData,
        service_payment_status: service?.service_payment_status ?? 'unpaid',
        service_paid_amount: String(
          receipt?.reduce(
            (acc, receipt) => Number(acc) + Number(receipt.service_paid_amount) || 0,
            0
          ) ?? 0
        )
      })
    }
    getService()
    // المناديب
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

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  async function editService(e: { preventDefault: () => void }) {
    e.preventDefault() // no refresh

    try {
      const response = await axios.patch(
        `${API_URL}/services/editById/${Number(serviceId)}`,
        { formData }
      )

      const { service_updated, message } = await response.data

      if (service_updated) {
        setServiceUpdated(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message

        navigate(`/service/${serviceId}`)
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
                  .filter(employee => employee.employee_id !== currentEmpolyee.id)
                  .map((employee, index) => (
                    <option key={index} value={serviceData?.representative_id}>
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
              type='number'
              inputMode='numeric'
              pattern='[0-9]*'
              id='service_total_price'
              name='service_total_price'
              placeholder='ادخل سعر الخدمة'
              onChange={handleChange}
              defaultValue={serviceData ? serviceData.service_total_price : ''}
              required
            />

            {/* 3 radio buttons if the service_payment_status is paid then the seleted radio button will be one of the 3 radio buttons */}
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
                  setFormData({ ...formData, service_payment_status: 'unpaid' })
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
                  setFormData({ ...formData, service_payment_status: 'partially-paid' })
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
                  setFormData({ ...formData, service_payment_status: 'paid' })
                }}
                defaultChecked={
                  serviceData?.service_payment_status === 'paid' ||
                  serviceData?.service_total_price ===
                    Number(formData.service_paid_amount)
                }
              />
            </div>

            {/* Conditional rendering of input for partially-paid status */}
            {formData.service_payment_status === 'partially-paid' && (
              <>
                <label htmlFor='service_paid_amount'>المبلغ المدفوع الجديد:</label>
                <input
                  type='number'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  min='0'
                  max={serviceData?.service_total_price}
                  id='service_paid_amount'
                  name='service_paid_amount'
                  placeholder={`المبلغ المدفوع حتى الآن: ${formData.service_paid_amount} درهم`}
                  aria-placeholder={formData.service_paid_amount}
                  onChange={handleChange}
                  required
                />
              </>
            )}

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

            <button
              type='submit'
              aria-disabled={serviceUpdated}
              style={{ cursor: serviceUpdated ? 'progress' : 'pointer' }}
              disabled={serviceUpdated}
            >
              حفظ التغييرات
            </button>
          </form>
        )}

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}

        {/* Link to navigate back to services page */}
        <Link to='/services' className='back-btn'>
          العودة إلى قائمة الخدمات
        </Link>
      </div>
    </section>
  )
}

export default ServiceEdit
