import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../utils/constants'
import ErrorPage from './error_page'
import { empType } from '../types'

export default function AddEmp() {
  const { empId } = useParams()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [fullName, setFullName] = useState('')
  const [nationality, setNationality] = useState('')
  const [startWorkingDate, setStartWorkingDate] = useState('')
  const [finalWorkingDate, setFinalWorkingDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')
  const [residencyEndDate, setResidencyEndDate] = useState('')
  const [personalIdNumber, setPersonalIdNumber] = useState('')
  const [passportIdNumber, setPassportIdNumber] = useState('')
  const [salaryAmount, setSalaryAmount] = useState('')
  const [comissionPercentage, setComissionPercentage] = useState('')

  const [userUpdated, setUserUpdated] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })

  const [employeeData, setEmployeeData] = useState<empType>()
  const navigate = useNavigate()

  async function fetchEmployeeById(id: string) {
    try {
      const { data } = await axios.get(`${API_URL}/employees/byId/${id}`)
      setEmployeeData(data)

      // Format date values
      setStartWorkingDate(new Date(data.start_working_date).toISOString().split('T')[0])
      setFinalWorkingDate(new Date(data.final_working_date).toISOString().split('T')[0])
      setContractEndDate(new Date(data.contract_end_date).toISOString().split('T')[0])
      setResidencyEndDate(new Date(data.residency_end_date).toISOString().split('T')[0])
    } catch (error: any) {
      console.error('Error fetching employee by id:', error.message)
    }
  }

  async function editEmployee(e: { preventDefault: () => void }) {
    e.preventDefault() // no refresh

    try {
      const response = await axios.patch(`${API_URL}/employees/editById/${empId}`, {
        username: username.replace(/\s/g, '_').toLocaleLowerCase(),
        password,
        role,
        fullName,
        nationality,
        startWorkingDate,
        finalWorkingDate,
        contractEndDate,
        residencyEndDate,
        personalIdNumber,
        passportIdNumber,
        salaryAmount,
        comissionPercentage
      })

      const { emp_updated, message } = await response.data

      // البيانات المرجعة من السيرفر
      console.log('data: ', { emp_updated, message })

      if (emp_updated) {
        setUserUpdated(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message

        navigate('/dashboard')
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
    empId && fetchEmployeeById(empId)
  }, [])

  return !empId || empId.length === 0 ? (
    <ErrorPage message='عفواً لم يتم العثور على بيانات الموظف' />
  ) : (
    <div dir='rtl' className='employees-container'>
      <h2>تعديل بيانات الموظف</h2>
      <h3></h3>

      <form dir='rtl' onSubmit={editEmployee}>
        <label htmlFor='username'>اسم المستخدم:</label>
        <small>اسم المستخدم باللغة الانجليزية يتكون من حروف صغيرة</small>
        <br />
        <input
          type='text'
          id='username'
          name='username'
          placeholder='ادخل اسم المستخدم'
          onChange={e => setUsername(e.target.value)}
          defaultValue={employeeData?.username || ''}
        />

        <label htmlFor='password'>كلمة المرور:</label>
        <br />
        <input
          type='password'
          id='password'
          name='password'
          placeholder='ادخل كلمة المرور'
          onChange={e => setPassword(e.target.value)}
        />

        <br />

        <label htmlFor='role'>الدور:</label>
        <br />
        {/* Select Box for role  and set the default value to the current role */}
        <select
          id='role'
          name='role'
          onChange={e => setRole(e.target.value)}
          defaultValue={employeeData?.role || ''}
        >
          {!employeeData?.role && <option value=''>اختر الدور</option>}
          <option value='admin'>مدير</option>
          <option value='employee'>موظف</option>
          <option value='accountant'>محاسب</option>
        </select>
        <br />

        <label htmlFor='fullName'>الاسم الكامل:</label>
        <br />
        <input
          type='text'
          id='fullName'
          name='fullName'
          placeholder='ادخل الاسم الكامل'
          onChange={e => setFullName(e.target.value)}
          defaultValue={employeeData?.full_name || ''}
        />
        <br />

        <label htmlFor='nationality'>الجنسية:</label>
        <br />
        <input
          type='text'
          id='nationality'
          name='nationality'
          placeholder='ادخل الجنسية'
          onChange={e => setNationality(e.target.value)}
          defaultValue={employeeData?.nationality || ''}
        />
        <br />

        <label htmlFor='start_working_date'>تاريخ بدء العمل:</label>
        <br />
        <input
          type='date'
          id='start_working_date'
          name='start_working_date'
          placeholder='ادخل تاريخ بدء العمل'
          onChange={e => setStartWorkingDate(e.target.value)}
          defaultValue={startWorkingDate || ''}
          dir='rtl'
        />
        <br />

        <label htmlFor='final_working_date'>تاريخ انتهاء العمل:</label>
        <br />
        <input
          type='date'
          id='final_working_date'
          name='final_working_date'
          placeholder='ادخل تاريخ انتهاء العمل'
          onChange={e => setFinalWorkingDate(e.target.value)}
          defaultValue={finalWorkingDate || ''}
          dir='rtl'
        />
        <br />

        <label htmlFor='contract_end_date'>تاريخ انتهاء العقد:</label>
        <br />
        <input
          type='date'
          id='contract_end_date'
          name='contract_end_date'
          placeholder='ادخل تاريخ انتهاء العقد'
          onChange={e => setContractEndDate(e.target.value)}
          defaultValue={contractEndDate || ''}
          dir='rtl'
        />
        <br />

        <label htmlFor='residency_end_date'>تاريخ انتهاء الاقامة:</label>
        <br />
        <input
          type='date'
          id='residency_end_date'
          name='residency_end_date'
          placeholder='ادخل تاريخ انتهاء الاقامة'
          onChange={e => setResidencyEndDate(e.target.value)}
          defaultValue={residencyEndDate || ''}
          dir='rtl'
        />
        <br />

        <label htmlFor='personal_id_number'>رقم الهوية الشخصية:</label>
        <br />
        <input
          type='text'
          id='personal_id_number'
          name='personal_id_number'
          placeholder='ادخل رقم الهوية الشخصية'
          onChange={e => setPersonalIdNumber(e.target.value)}
          defaultValue={employeeData?.personal_id_number || ''}
        />
        <br />

        <label htmlFor='passport_id_number'>رقم جواز السفر:</label>
        <br />
        <input
          type='text'
          id='passport_id_number'
          name='passport_id_number'
          placeholder='ادخل رقم جواز السفر'
          onChange={e => setPassportIdNumber(e.target.value)}
          defaultValue={employeeData?.passport_id_number || ''}
        />
        <br />

        <label htmlFor='salary_amount'>الراتب:</label>
        <br />
        <input
          type='number'
          id='salary_amount'
          name='salary_amount'
          placeholder='ادخل الراتب'
          onChange={e => setSalaryAmount(e.target.value)}
          defaultValue={employeeData?.salary_amount || ''}
        />
        <br />

        <label htmlFor='commition_percentage'>نسبة العمولة:</label>
        <br />
        <input
          type='number'
          min='0'
          max='100'
          id='commition_percentage'
          name='commition_percentage'
          placeholder='ادخل نسبة العمولة'
          onChange={e => setComissionPercentage(e.target.value)}
          defaultValue={employeeData?.comission_percentage}
        />
        <br />

        <input
          type='submit'
          value='تعديل الموظف'
          aria-disabled={userUpdated}
          style={{ cursor: userUpdated ? 'progress' : 'pointer' }}
          disabled={userUpdated}
        />

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}
      </form>

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
