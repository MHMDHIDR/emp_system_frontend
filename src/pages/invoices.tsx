import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { arabicDate, fetchReceipts, getAllOfficeDetails } from '../utils/helpers'
import { officeDetailsType, receiptsType } from '../types'
import { AddIcon } from '../components/Icons'
import PrintSelectedReceipts from './PrintSelectedReceipts'

export default function Invoices() {
  const { customerId } = useParams()
  const [receipts, setReceipts] = useState<receiptsType[]>([])
  const [selectedReceipts, setSelectedReceipts] = useState<receiptsType[]>([])
  const [allOfficeDetails, setAllOfficeDetails] = useState<officeDetailsType[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const getAllReceipts = async () => {
    const receipts = (await fetchReceipts({
      customerId: Number(customerId)
    })) as receiptsType[]

    setReceipts(receipts)
    setSelectedReceipts([])
  }

  useEffect(() => {
    const getOfficeDetails = async () => {
      const officeDetails = await getAllOfficeDetails()

      setAllOfficeDetails(officeDetails)
    }
    const allReceipts = async () => await getAllReceipts()
    getOfficeDetails()
    allReceipts()
  }, [])

  const handleSelectAll = (event: { target: { checked: any } }) => {
    const isChecked = event.target.checked
    setSelectAll(isChecked)

    const updatedReceipts = receipts.map(receipt => {
      return { ...receipt, selected: isChecked }
    })
    setReceipts(updatedReceipts)
    setSelectedReceipts(isChecked ? receipts : [])
  }

  const handleCheckboxChange = (receiptId: number) => {
    const updatedReceipts = receipts.map(receipt => {
      if (receipt.receipt_id === receiptId) {
        return { ...receipt, selected: !receipt.selected }
      }
      return receipt
    })
    setReceipts(updatedReceipts)

    const selected = updatedReceipts.filter(receipt => receipt.selected)
    setSelectedReceipts(selected)
  }

  return (
    <section>
      <div>
        <PrintSelectedReceipts
          selectedReceipts={selectedReceipts}
          officeDetails={allOfficeDetails[0]}
        />
      </div>

      <div dir='rtl' className='invoices-container'>
        <h2>بيانات الفواتير</h2>
        <table dir='rtl'>
          <thead>
            <tr>
              <th style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  id='selectAll'
                  type='checkbox'
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label htmlFor='selectAll' style={{ cursor: 'pointer' }}>
                  تحديد الكل
                </label>
              </th>
              <th>تسلسل</th>
              <th>تاريخ الفتوره</th>
              <th>اسم العميل</th>
              <th>الخدمة</th>
              <th>السعر</th>
              <th>الموظف المسئول</th>
            </tr>
          </thead>
          <tbody>
            {!receipts || receipts.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  لا يوجد فواتير
                  <br />
                  <Link
                    to='/services'
                    className='back-btn'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <AddIcon />
                    إضافة خدمة جديدة
                  </Link>
                </td>
              </tr>
            ) : (
              receipts.map(receipt => (
                <tr key={receipt.receipt_id}>
                  <td>
                    <input
                      type='checkbox'
                      checked={receipt.selected || false}
                      onChange={() => handleCheckboxChange(receipt.receipt_id)}
                      style={{
                        cursor: 'pointer',
                        height: '20px',
                        width: '100%',
                        marginInline: 'auto'
                      }}
                    />
                  </td>
                  <td>{receipt.receipt_id}</td>
                  <td>{arabicDate(receipt.created_at)}</td>
                  <td>{receipt.client_name}</td>
                  <td>{receipt.service_name}</td>
                  <td>{receipt.service_paid_amount}</td>
                  <td>{receipt.full_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Link to='/dashboard' className='back-btn'>
          العودة
        </Link>
      </div>
    </section>
  )
}
