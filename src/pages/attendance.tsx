import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { arabicDate, fetchAllEmployees, getArabicRole } from '../utils/helpers'
import { empType } from '../types'

export default function AddEmp() {
  const [allEmployees, setAllEmployees] = useState<empType[]>([])

  useEffect(() => {
    const getRepresentatives = async () => {
      const employees = await fetchAllEmployees()

      setAllEmployees(employees as empType[])
    }
    getRepresentatives()
  }, [])

  return (
    <div dir='rtl' className='employees-container'>
      <h2>جدول الحضور والإنصراف</h2>

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
          {allEmployees.map((emp, index: number) => (
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
