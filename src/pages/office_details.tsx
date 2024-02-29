import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/constants'
import { getAllOfficeDetails } from '../utils/helpers'
import type { officeDetailsType } from '../types'

export default function AddOfficeDetails() {
  // const [arOfficeName, setArOfficeName] = useState('')
  // const [enOfficeName, setEnOfficeName] = useState('')
  // const [arOfficeAddress, setArOfficeAddress] = useState('')
  // const [enOfficeAddress, setEnOfficeAddress] = useState('')
  const [officePhone, setOfficePhone] = useState('')
  const [officeEmail, setOfficeEmail] = useState('')
  const [officeTaxNumber, setOfficeTaxNumber] = useState('')

  const [isOfficeDetailsAdded, setIsOfficeDetailsAdded] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })
  const [allOfficeDetails, setAllOfficeDetails] = useState<officeDetailsType[]>([])
  const navigate = useNavigate()

  async function updateOfficeDetails(e: { preventDefault: () => void }) {
    e.preventDefault()

    try {
      const response = await axios.patch(`${API_URL}/office-details/updateDetails`, {
        // ar_office_name: arOfficeName ?? allOfficeDetails[0]?.ar_office_name,
        // en_office_name: enOfficeName ?? allOfficeDetails[0]?.en_office_name,
        // ar_office_address: arOfficeAddress ?? allOfficeDetails[0]?.ar_office_address,
        // en_office_address: enOfficeAddress ?? allOfficeDetails[0]?.en_office_address,
        office_phone: officePhone ?? allOfficeDetails[0]?.office_phone,
        office_email: officeEmail ?? allOfficeDetails[0]?.office_email,
        office_tax_number: Number(
          officeTaxNumber ?? allOfficeDetails[0]?.office_tax_number
        )
      } as officeDetailsType)

      const { is_office_details_added, message } = await response.data

      if (is_office_details_added) {
        setIsOfficeDetailsAdded(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message

        navigate(`/office_details`)
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

  useEffect(() => {
    const getOfficeDetails = async () => {
      const officeDetails = await getAllOfficeDetails()

      setAllOfficeDetails(officeDetails)
    }
    getOfficeDetails()
  }, [])

  return (
    <div dir='rtl' className='officeDetails-container'>
      <h2>تحديث بيانات المكتب</h2>

      <form dir='rtl' onSubmit={updateOfficeDetails}>
        {/* <label htmlFor='ar_office_name'>اسم المكتب باللغة العربية:</label>
        <br />
        <input
          type='text'
          id='ar_office_name'
          name='ar_office_name'
          placeholder='ادخل اسم المكتب باللغة العربية'
          defaultValue={allOfficeDetails[0]?.ar_office_name}
          onChange={e => setArOfficeName(e.target.value)}
        />

        <label htmlFor='en_office_name'>اسم المكتب باللغة الإنجليزية:</label>
        <br />
        <input
          type='text'
          id='en_office_name'
          name='en_office_name'
          placeholder='ادخل اسم المكتب باللغة الإنجليزية'
          defaultValue={allOfficeDetails[0]?.en_office_name ?? ''}
          onChange={e => setEnOfficeName(e.target.value)}
        />

        <label htmlFor='ar_office_address'>عنوان المكتب باللغة العربية:</label>
        <br />
        <input
          type='text'
          id='ar_office_address'
          name='ar_office_address'
          placeholder='ادخل عنوان المكتب باللغة العربية'
          defaultValue={allOfficeDetails[0]?.ar_office_address}
          onChange={e => setArOfficeAddress(e.target.value)}
        />

        <label htmlFor='en_office_address'>عنوان المكتب باللغة الإنجليزية:</label>
        <br />
        <input
          type='text'
          id='en_office_address'
          name='en_office_address'
          placeholder='ادخل عنوان المكتب باللغة الإنجليزية'
          defaultValue={allOfficeDetails[0]?.en_office_address}
          onChange={e => setEnOfficeAddress(e.target.value)}
        /> */}

        <label htmlFor='office_phone'>رقم هاتف المكتب:</label>
        <br />
        <input
          type='tel'
          id='office_phone'
          name='office_phone'
          placeholder='ادخل رقم هاتف المكتب'
          defaultValue={allOfficeDetails[0]?.office_phone}
          onChange={e => setOfficePhone(e.target.value)}
          style={{ textAlign: 'right' }}
          dir='ltr'
        />
        <br />

        <label htmlFor='office_email'>البريد الالكتروني:</label>
        <br />
        <input
          type='email'
          id='office_email'
          name='office_email'
          placeholder='ادخل البريد الالكتروني للمكتب'
          defaultValue={allOfficeDetails[0]?.office_email}
          onChange={e => setOfficeEmail(e.target.value)}
          style={{ textAlign: 'right' }}
          dir='ltr'
        />
        <br />

        <label htmlFor='office_tax_number'>رقم الضريبة:</label>
        <br />
        <input
          type='tel'
          id='office_tax_number'
          name='office_tax_number'
          placeholder='ادخل رقم الضريبة للمكتب'
          defaultValue={allOfficeDetails[0]?.office_tax_number}
          onChange={e => setOfficeTaxNumber(e.target.value)}
          style={{ textAlign: 'right' }}
          dir='ltr'
        />
        <br />

        <button
          type='submit'
          aria-disabled={isOfficeDetailsAdded}
          style={{ cursor: isOfficeDetailsAdded ? 'progress' : 'pointer' }}
          disabled={isOfficeDetailsAdded}
        >
          تحديث بيانات المكتب
        </button>
      </form>

      {isOfficeDetailsAdded && alertMessage.message && (
        <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
      )}

      <div>
        <h2 className='text-center'>بيانات المكتب</h2>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>اسم المكتب باللغة العربية</th>
                <th>اسم المكتب باللغة الإنجليزية</th>
                <th>عنوان المكتب باللغة العربية</th>
                <th>عنوان المكتب باللغة الإنجليزية</th>
                <th>رقم هاتف المكتب</th>
                <th>البريد الالكتروني</th>
                <th>رقم الضريبة</th>
              </tr>
            </thead>
            <tbody>
              {allOfficeDetails.map((emp, index: number) => (
                <tr key={index}>
                  <td>{emp.ar_office_name}</td>
                  <td>{emp.en_office_name}</td>
                  <td>{emp.ar_office_address}</td>
                  <td>{emp.en_office_address}</td>
                  <td style={{ direction: 'ltr' }}>{emp.office_phone}</td>
                  <td>{emp.office_email}</td>
                  <td style={{ direction: 'ltr' }}>{emp.office_tax_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
