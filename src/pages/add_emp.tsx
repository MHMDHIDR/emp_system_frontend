import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/constants'
import { arabicDate, fetchAllEmployees, getArabicRole } from '../utils/helpers'
import { empType } from '../types'

export default function AddEmployee() {
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
  const [userAdded, setUserAdded] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })

  const [allEmployees, setAllEmployees] = useState<empType[]>([])

  const navigate = useNavigate()

  async function addUser(e: { preventDefault: () => void }) {
    e.preventDefault() // no refresh

    try {
      const response = await axios.post(`${API_URL}/employees/add_emp`, {
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

      const { id, isAdmin, full_name, emp_added, message } = await response.data

      // البيانات المرجعة من السيرفر
      console.log('data: ', { id, isAdmin, full_name, emp_added, message })

      if (emp_added) {
        setUserAdded(true)
        setAlertMessage({ message: message, type: 'success' }) // Set success message

        navigate(`add_emp`)
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
    const getRepresentatives = async () => {
      const employees = await fetchAllEmployees()

      const uniqueRepresentative =
        typeof employees === 'object' && Array.isArray(employees)
          ? (Array.from(new Set(employees.map(employee => employee.full_name)))
              .map(fullName => {
                return employees.find(
                  employee => employee.full_name === fullName && employee.role !== 'admin'
                )
              })
              .filter(employee => employee !== undefined) as empType[])
          : []

      setAllEmployees(uniqueRepresentative as empType[])
    }
    getRepresentatives()
  }, [])

  async function deleteEmployee(empId: number) {
    try {
      const response = await axios.delete(`${API_URL}/employees/delete_emp/${empId}`)
      const { emp_deleted, message } = await response.data
      if (emp_deleted) {
        setAlertMessage({ message: message, type: 'success' }) // Set success message
        fetchAllEmployees()
      } else {
        setAlertMessage({ message: message, type: 'error' }) // Set error message
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل حذف الموظف حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  return (
    <div dir='rtl' className='employees-container'>
      <h2>إضافة موظف جديد</h2>

      <form dir='rtl' onSubmit={addUser}>
        <label htmlFor='username'>اسم المستخدم:</label>
        <small>اسم المستخدم باللغة الانجليزية يتكون من حروف صغيرة</small>
        <br />
        <input
          type='text'
          id='username'
          name='username'
          placeholder='ادخل اسم المستخدم'
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label htmlFor='password'>كلمة المرور:</label>
        <br />
        <input
          type='password'
          id='password'
          name='password'
          placeholder='ادخل كلمة المرور'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <br />

        <label htmlFor='role'>الدور:</label>
        <br />
        <select
          id='role'
          name='role'
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          <option value=''>اختر الدور</option>
          <option value='employee'>موظف</option>
          <option value='admin'>مدير</option>
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
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <br />

        <label htmlFor='nationality'>الجنسية:</label>
        <br />
        <input
          type='text'
          id='nationality'
          name='nationality'
          placeholder='ادخل الجنسية'
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          required
        />
        <br />
        <br />
        <label htmlFor='start_working_date'>تاريخ بدء العمل:</label>
        <br />
        <input
          type='date'
          id='start_working_date'
          name='start_working_date'
          placeholder='ادخل تاريخ بدء العمل'
          value={startWorkingDate}
          onChange={e => setStartWorkingDate(e.target.value)}
          dir='rtl'
          required
        />
        <br />
        <label htmlFor='final_working_date'>تاريخ انتهاء العمل:</label>
        <br />
        <input
          type='date'
          id='final_working_date'
          name='final_working_date'
          placeholder='ادخل تاريخ انتهاء العمل'
          value={finalWorkingDate}
          onChange={e => setFinalWorkingDate(e.target.value)}
          dir='rtl'
          required
        />
        <br />
        <label htmlFor='contract_end_date'>تاريخ انتهاء العقد:</label>
        <br />
        <input
          type='date'
          id='contract_end_date'
          name='contract_end_date'
          placeholder='ادخل تاريخ انتهاء العقد'
          value={contractEndDate}
          onChange={e => setContractEndDate(e.target.value)}
          dir='rtl'
          required
        />
        <br />
        <label htmlFor='residency_end_date'>تاريخ انتهاء الاقامة:</label>
        <br />
        <input
          type='date'
          id='residency_end_date'
          name='residency_end_date'
          placeholder='ادخل تاريخ انتهاء الاقامة'
          value={residencyEndDate}
          onChange={e => setResidencyEndDate(e.target.value)}
          dir='rtl'
          required
        />
        <br />
        <label htmlFor='personal_id_number'>رقم الهوية الشخصية:</label>
        <br />
        <input
          type='text'
          id='personal_id_number'
          name='personal_id_number'
          placeholder='ادخل رقم الهوية الشخصية'
          value={personalIdNumber}
          onChange={e => setPersonalIdNumber(e.target.value)}
          required
        />
        <br />
        <label htmlFor='passport_id_number'>رقم جواز السفر:</label>
        <br />
        <input
          type='text'
          id='passport_id_number'
          name='passport_id_number'
          placeholder='ادخل رقم جواز السفر'
          value={passportIdNumber}
          onChange={e => setPassportIdNumber(e.target.value)}
          required
        />
        <br />
        <label htmlFor='salary_amount'>الراتب:</label>
        <br />
        <input
          type='number'
          id='salary_amount'
          name='salary_amount'
          placeholder='ادخل الراتب'
          value={salaryAmount}
          onChange={e => setSalaryAmount(e.target.value)}
          required
        />
        <br />
        <label htmlFor='commition_percentage'> نسبة العمولة :</label>
        <br />
        <input
          type='number'
          min={'0'}
          max={'100'}
          id='commition_percentage'
          name='commition_percentage'
          onChange={e => setComissionPercentage(e.target.value)}
          placeholder='ادخل نسبة العمولة الثابتة  '
          required
        />
        <br />
        <input
          type='submit'
          value='إضافة موظف جديد'
          aria-disabled={userAdded}
          style={{ cursor: userAdded ? 'progress' : 'pointer' }}
          disabled={userAdded}
        />

        {alertMessage.message && (
          <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
        )}

        <div>
          <h3>بيانات الموظفين المضافة</h3>
          <div className='table-container'>
            <table>
              <thead>
                <tr>
                  <th>اسم المستخدم</th>
                  <th>الدور</th>
                  <th>الاسم الكامل</th>
                  <th>الجنسية</th>
                  <th>تاريخ بدء العمل</th>
                  <th>تاريخ انتهاء العمل</th>
                  <th>تاريخ انتهاء العقد</th>
                  <th>تاريخ انتهاء الإقامة</th>
                  <th>رقم الهوية الشخصية</th>
                  <th>رقم جواز السفر</th>
                  <th>الراتب</th>
                  <th>نسبة العمولة</th>
                  <th>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.map((emp, index: number) => (
                  <tr key={index}>
                    <td>{emp.username}</td>
                    <td>{getArabicRole(emp.role)}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.nationality}</td>
                    <td>{arabicDate(emp.start_working_date)}</td>
                    <td>{arabicDate(emp.final_working_date)}</td>
                    <td>{arabicDate(emp.contract_end_date)}</td>
                    <td>{arabicDate(emp.residency_end_date)}</td>
                    <td>{emp.personal_id_number}</td>
                    <td>{emp.passport_id_number}</td>
                    <td>{emp.salary_amount}</td>
                    <td>{emp.comission_percentage}</td>
                    <td>
                      <Link to={`/edit_emp/${emp.employee_id}`} className='back-btn'>
                        تعديل الموظف
                      </Link>
                      {/* حذف الموظف */}
                      <button
                        onClick={() => deleteEmployee(emp.employee_id)}
                        className='logout-btn'
                      >
                        حذف الموظف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
