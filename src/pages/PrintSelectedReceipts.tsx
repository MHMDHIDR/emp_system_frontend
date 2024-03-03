import React, { forwardRef, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { arabicDate, constructReferenceNumber, formattedPrice } from '../utils/helpers'
import type { officeDetailsType, receiptsType } from '../types'

const IconPath = `${__dirname.split('/out')[0]}/images/System_typing_Center.png`

const PrintSelectedReceipts = ({
  selectedReceipts,
  officeDetails
}: {
  selectedReceipts: receiptsType[]
  officeDetails: officeDetailsType
}) => {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current // Return ref directly
  })

  return (
    <div
      style={{
        direction: 'rtl',
        marginTop: '10px',
        borderRadius: '20px',
        padding: '10px'
      }}
    >
      <button
        onClick={handlePrint}
        style={{
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '10px',
          cursor: 'pointer',
          opacity: selectedReceipts.length === 0 ? 0.5 : 1,
          pointerEvents: selectedReceipts.length === 0 ? 'none' : 'auto'
        }}
        className='back-btn'
        disabled={selectedReceipts.length === 0}
      >
        طباعة الفواتير المحددة
      </button>
      <div style={{ display: 'none' }}>
        {selectedReceipts && selectedReceipts.length > 0 && (
          <PrintContent
            ref={componentRef}
            selectedReceipts={selectedReceipts}
            officeDetails={officeDetails}
          />
        )}
      </div>
    </div>
  )
}

const PrintContent = forwardRef<
  HTMLDivElement,
  {
    selectedReceipts: receiptsType[]
    officeDetails: officeDetailsType
  }
>(({ selectedReceipts, officeDetails }, ref) => (
  <div
    ref={ref}
    style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '20px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    }}
  >
    <div
      style={{
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}
    >
      <div>
        <h3>{officeDetails.en_office_name}</h3>
        <p>{officeDetails.en_office_address}</p>
        <p>{officeDetails.office_phone}</p>
        <p>{officeDetails.office_email}</p>
        {officeDetails.office_tax_number && (
          <small>الرقم الضريبي: {officeDetails.office_tax_number}</small>
        )}
      </div>
      <img
        src={IconPath}
        alt='System Typing Center'
        style={{ width: '150px', height: '150px', objectFit: 'contain' }}
      />
      <div style={{ textAlign: 'right' }}>
        <h3>{officeDetails.ar_office_name}</h3>
        <p>{officeDetails.ar_office_address}</p>
        <p>{officeDetails.office_phone}</p>
        <p>{officeDetails.office_email}</p>
        {officeDetails.office_tax_number && (
          <small>الرقم الضريبي: {officeDetails.office_tax_number}</small>
        )}
      </div>
    </div>
    <h1
      style={{
        textAlign: 'center',
        borderBottom: '2px solid skyblue',
        paddingBottom: '10px',
        direction: 'rtl'
      }}
    >
      <span>رقم الفاتورة:</span>{' '}
      {constructReferenceNumber(
        selectedReceipts.map(receipt => receipt.service_id),
        selectedReceipts.map(receipt => receipt.receipt_id)
      )}
    </h1>
    <br />
    <span style={{ textAlign: 'center', display: 'block' }}>
      <b>التاريخ:</b> {new Date().toLocaleDateString()}
    </span>
    <table
      style={{
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '20px',
        width: '100%',
        borderCollapse: 'collapse',
        direction: 'rtl'
      }}
    >
      <thead>
        <tr style={{ backgroundColor: 'lightblue', color: 'darkblue' }}>
          <th style={{ padding: '10px' }}>الرقم التسلسلي</th>
          <th style={{ padding: '10px' }}>اســـم العميل</th>
          <th style={{ padding: '10px' }}>اســـم الخدمة</th>
          <th style={{ padding: '10px' }}>المبلغ المدفوع</th>
          <th style={{ padding: '10px' }}>الموظف المسؤول</th>
          <th style={{ padding: '10px' }}>تاريخ الفاتورة</th>
        </tr>
      </thead>
      <tbody>
        {selectedReceipts.map(receipt => (
          <tr key={receipt.receipt_id} style={{ borderBottom: '1px solid lightgrey' }}>
            <td style={{ padding: '10px' }}>{receipt.receipt_id}</td>
            <td style={{ padding: '10px' }}>{receipt.client_name}</td>
            <td style={{ padding: '10px' }}>{receipt.service_name}</td>
            <td style={{ padding: '10px' }}>
              {formattedPrice(receipt.service_paid_amount, 2)}
            </td>
            <td style={{ padding: '10px' }}>{receipt.full_name}</td>
            <td style={{ padding: '10px' }}>{arabicDate(receipt.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))

export default PrintSelectedReceipts
