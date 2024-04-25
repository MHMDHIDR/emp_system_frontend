import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { arabicDate, fetchAllEmployees, getArabicRole } from '../utils/helpers'
import { empType } from '../types'
import HomeButton from '../components/HomeButton'

export default function AddEmp() {
  const [allEmployees, setAllEmployees] = useState<empType[]>([])
  const [employeeName, setEmployeeName] = useState<string>('')
  const [monthName, setMonthName] = useState<string>('')

  useEffect(() => {
    const getRepresentatives = async () => {
      const employees = await fetchAllEmployees()
      setAllEmployees(employees as unknown as empType[])
    }
    getRepresentatives()
  }, [])

  const filteredEmployees = allEmployees.filter(emp => {
    const nameMatch = emp.full_name.toLowerCase().includes(employeeName.toLowerCase())
    const monthMatch = arabicDate(emp.login_time, true)
      .toLowerCase()
      .includes(monthName.toLowerCase())
    return nameMatch && monthMatch
  })

  return (
    <div dir='rtl' className='employees-container'>
      <h2>جدول الحضور والإنصراف</h2>

      <div>
        <input
          type='text'
          placeholder='ابحث عن اسم الموظف'
          value={employeeName}
          onChange={e => setEmployeeName(e.target.value)}
        />
        <input
          type='text'
          placeholder='ابحث عن اسم الشهر'
          value={monthName}
          onChange={e => setMonthName(e.target.value)}
        />
      </div>

      <HomeButton />

      <table>
        <thead>
          <tr>
            <th>الرقم التسلسلي</th>
            <th>اسم المستخدم</th>
            <th>الدور</th>
            <th>الاسم الكامل</th>
            <th>تاريخ وزمن الحضور</th>
            <th>تاريخ وزمن الإنصراف</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, index: number) => (
            <tr key={index}>
              <td>{emp.employee_id}</td>
              <td>{emp.username}</td>
              <td>{getArabicRole(emp.role)}</td>
              <td>{emp.full_name}</td>
              <td>
                {emp.login_time ? arabicDate(emp.login_time, true) : 'لم يسجل دخول بعد'}
              </td>
              <td>
                {emp.logout_time ? arabicDate(emp.logout_time, true) : 'لم ينصرف بعد'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
