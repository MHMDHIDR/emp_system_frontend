import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../utils/constants'
import { LoadingPage } from '../components/Loading'
import { getEmployeeName } from '../utils/helpers'
import { customerCredentialsType, customerType, getEmployeeNameType } from '../types'

export default function CustomersShow() {
  const [customersData, setCustomersData] = useState<customerType>()
  const [employeeName, setEmployeeName] = useState('')
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })

  const { customerId } = useParams()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data }: { data: customerType } = await axios.get(
          `${API_URL}/customers/byId/${customerId}`
        )

        const { employeeName }: { employeeName: getEmployeeNameType } =
          await getEmployeeName(data?.employee_id)
        setEmployeeName(employeeName.name)
        setLoading(employeeName.isLoading)

        setCustomersData(data)
        setLoading(false)
      } catch (error: any) {
        console.error('Error fetching customer by id:', error.message)
        setAlertMessage({
          message: 'Error fetching customer data',
          type: 'error'
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [customerId])

  return (
    <section>
      <div className='page-container'>
        <h2>عرض بيانات العميل</h2>
        {loading ? (
          <LoadingPage />
        ) : (
          <div dir='rtl'>
            <div>
              <strong>بيانات الدخول للانظمة:</strong>{' '}
              {customersData?.customer_credentials
                ? JSON.parse(String(customersData?.customer_credentials)).map(
                    (credential: customerCredentialsType, index: number) => (
                      <div key={credential.websiteName + index}>
                        <strong>اسم الموقع:</strong> {credential.websiteName}
                        <br />
                        <strong>اسم المستخدم:</strong> {credential.username}
                        <br />
                        <strong>كلمة المرور:</strong> {credential.password}
                        <br />
                      </div>
                    )
                  )
                : 'لا يوجد بيانات'}
            </div>
            <div>
              <strong>اسم العميل:</strong> {customersData?.client_name}
            </div>
            <div>
              <strong>الجنسية:</strong> {customersData?.nationality}
            </div>
            <div>
              <strong>رقم التليفون:</strong> {customersData?.phone_number}
            </div>
            <div>
              <strong>الاميل:</strong> {customersData?.email}
            </div>
            <div>
              <strong>الوظيفة:</strong> {customersData?.job_title}
            </div>
            <div>
              <strong>الموظف المسئول:</strong> {employeeName}
            </div>
            <div>
              <strong>كيفية التعرف علي المكتب:</strong>{' '}
              {customersData?.office_discovery_method}
            </div>
            <Link to={`/customers/${customersData?.id}/edit`} className='back-btn'>
              تعديل بيانات العميل
            </Link>
          </div>
        )}
        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}
        <Link to='/customers' className='back-btn'>
          العودة
        </Link>
        {/* Add modal code here if needed */}
      </div>
    </section>
  )
}
