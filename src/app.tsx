import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import Login from './pages/login'
import AddEmp from './pages/add_emp'
import AddOfficeDetails from './pages/office_details'
import Attendance from './pages/attendance'
import EditEmp from './pages/edit_emp'
import Invoices from './pages/invoices'
import Customers from './pages/customers'
import CustomersEdit from './pages/customersEdit'
import Services from './pages/services'
import ServiceEdit from './pages/serviceEdit'
import CustomersShow from './pages/customersShow'
import ErrorPage from './pages/error_page'
import Revenues from './pages/revenues'
import Discharges from './pages/discharges'

export default function AppRoot() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if employee_data exists in local storage
    const employeeData = localStorage.getItem('employee_data')
    setIsLoggedIn(!!employeeData)

    //stop zoom in and zoom out
    const handleZoom = (event: {
      ctrlKey: any
      metaKey: any
      key: string
      preventDefault: () => void
    }) => {
      // Prevent zooming using keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-')) {
        event.preventDefault()
      }
    }

    // Prevent opening inspect tool using keyboard shortcut Ctrl+Shift+I
    const handleInspect = (event: {
      ctrlKey: any
      shiftKey: any
      code: string
      preventDefault: () => void
    }) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
        event.preventDefault()
      }
    }

    // Prevent Ctrl + R for refresh
    const handleRefresh = (event: {
      ctrlKey: any
      key: string
      preventDefault: () => void
    }) => {
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleZoom)
    window.addEventListener('keydown', handleInspect)
    window.addEventListener('keydown', handleRefresh)

    return () => {
      window.removeEventListener('keydown', handleZoom)
      window.removeEventListener('keydown', handleInspect)
      window.removeEventListener('keydown', handleRefresh)
    }
  }, [])

  return (
    <>
      <HashRouter>
        <Routes>
          <Route
            path='/'
            element={isLoggedIn ? <Navigate to='/dashboard' /> : <Login />}
          />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/office_details' element={<AddOfficeDetails />} />
          <Route path='/add_emp' element={<AddEmp />} />
          <Route path='/edit_emp/:empId' element={<EditEmp />} />
          <Route path='/services' element={<Services />} />
          <Route path='/services/:customerId' element={<Services />} />
          <Route path='/service/:id' element={<ServiceEdit />} />
          <Route path='/invoices' element={<Invoices />} />
          <Route path='/invoices/:customerId' element={<Invoices />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/customers' element={<Customers />} />
          <Route path='/revenues' element={<Revenues />} />
          <Route path='/discharges' element={<Discharges />} />
          <Route path='/customers/:customerId' element={<CustomersShow />} />
          <Route path='/customers/:customerId/edit' element={<CustomersEdit />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </HashRouter>
    </>
  )
}
