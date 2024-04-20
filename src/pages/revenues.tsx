import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchReceipts, getAllOfficeDetails } from '../utils/helpers'

type OfficeDetails = {
  office_id: number
  // Define other properties
}

type Receipt = {
  receipt_id: number
  office_id: number
  created_at: string
  client_name: string
  service_paid_amount: number
  employee_id: number
  selected?: boolean
}

export default function Invoices() {
  const { customerId } = useParams<{ customerId: string }>()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [_selectedReceipts, setSelectedReceipts] = useState<Receipt[]>([])
  const [allOfficeDetails, setAllOfficeDetails] = useState<OfficeDetails[]>([])
  const [_totalRevenue, setTotalRevenue] = useState<number>(0)
  const [incomeByDate, setIncomeByDate] = useState<{ [key: string]: number }>({})
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([])

  const getAllReceipts = async () => {
    try {
      const receiptsData: Receipt[] | any = await fetchReceipts({
        customerId: Number(customerId)
      })
      setReceipts(receiptsData)
      setSelectedReceipts([])
    } catch (error) {
      console.error('Error fetching receipts:', error)
      // Handle error if necessary
    }
  }

  useEffect(() => {
    const getOfficeDetails = async () => {
      try {
        const officeDetailsData: OfficeDetails[] = await getAllOfficeDetails()
        setAllOfficeDetails(officeDetailsData)
      } catch (error) {
        console.error('Error fetching office details:', error)
        // Handle error if necessary
      }
    }
    const fetchAllReceipts = async () => await getAllReceipts()
    getOfficeDetails()
    fetchAllReceipts()
  }, [])

  useEffect(() => {
    const calculateTotalRevenue = () => {
      let total = 0
      allOfficeDetails.forEach(office => {
        const officeRevenue = receipts.reduce((acc, receipt) => {
          if (receipt.office_id === office.office_id) {
            return acc + parseFloat(receipt.service_paid_amount.toString())
          }
          return acc
        }, 0)
        total += officeRevenue
      })
      setTotalRevenue(total)
    }
    calculateTotalRevenue()
  }, [receipts, allOfficeDetails])

  const arabicDate = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    const arabicMonths = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر'
    ]
    const year = date
      .getFullYear()
      .toString()
      .split('')
      .map(digit => arabicNumbers[parseInt(digit)])
      .join('')
    const month = arabicMonths[date.getMonth()]
    const day = date
      .getDate()
      .toString()
      .split('')
      .map(digit => arabicNumbers[parseInt(digit)])
      .join('')
    return `${day} ${month} ${year}`
  }

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  // const filteredReceipts = receipts.filter(receipt => {
  //   const date = arabicDate(receipt.created_at)
  //   const monthName = date.split(' ')[1] // Extract month name
  //   return monthName.toLowerCase().includes(searchTerm.toLowerCase())
  // })

  useEffect(() => {
    const calculateIncomeByDate = () => {
      const incomeMap: { [key: string]: number } = {}
      receipts.forEach(receipt => {
        const date = arabicDate(receipt.created_at)
        incomeMap[date] =
          (incomeMap[date] || 0) + parseFloat(receipt.service_paid_amount.toString())
      })
      setIncomeByDate(incomeMap)
    }
    calculateIncomeByDate()
  }, [receipts])

  // UseEffect to update the filteredReceipts based on the searchTerm
  useEffect(() => {
    const filteredReceipts = receipts.filter(receipt => {
      const date = arabicDate(receipt.created_at)
      const monthName = date.split(' ')[1] // Extract month name
      return monthName.toLowerCase().includes(searchTerm.toLowerCase())
    })
    setFilteredReceipts(filteredReceipts)
  }, [searchTerm, receipts])

  // when searchTerm changes , incomeByDate will be updated based on the month entered in the search input
  // that must match incomeByDate key
  useEffect(() => {
    const calculateIncomeByDate = () => {
      const incomeMap: { [key: string]: number } = {}
      filteredReceipts.forEach(receipt => {
        const date = arabicDate(receipt.created_at)
        incomeMap[date] =
          (incomeMap[date] || 0) + parseFloat(receipt.service_paid_amount.toString())
      })
      setIncomeByDate(incomeMap)
    }
    calculateIncomeByDate()
  }, [filteredReceipts])

  return (
    <section>
      <div dir='rtl' className='invoices-container'>
        <h2> الايرادات</h2>
        <input
          type='text'
          placeholder='ابحث بواسطة اسم الشهر...'
          value={searchTerm}
          onChange={handleSearchTermChange}
          style={{ marginBottom: '10px' }}
        />
        <table dir='rtl'>
          <thead>
            <tr>
              <th colSpan={7}>التاريخ</th>
              <th> الإيراد</th>
            </tr>
          </thead>
          <tbody>
            {!filteredReceipts || filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  لا يوجد نتائج بحث
                  <br />
                </td>
              </tr>
            ) : (
              <>
                {Object.keys(incomeByDate).map((date, index) => (
                  <tr key={index}>
                    <td colSpan={7}>{date}</td>
                    <td>{incomeByDate[date]}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={7}>المجــــــموع</td>
                  <td>
                    {Object.values(incomeByDate).reduce(
                      (total, value) => total + value,
                      0
                    )}
                  </td>
                </tr>
              </>
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
