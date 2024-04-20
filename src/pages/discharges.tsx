import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { arabicDate, onlyNumbers } from '../utils/helpers'
import { API_URL } from '../utils/constants'
import axios from 'axios'
import { expensesType } from '../types'
import HomeButton from '../components/HomeButton'

export default function ExpenseEntryPage() {
  const [amount, setAmount] = useState('')
  const [expense_name, setExpenseName] = useState('')
  const [description, setDescription] = useState('')
  const [created_at, setCreated_at] = useState('')
  const [expenseAdded, setExpenseAdded] = useState(false)
  const [expenseDeleted, setExpenseDeleted] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' })

  const [allExpenses, setAllExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [totalDisbursement, setTotalDisbursement] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${API_URL}/expenses/addExpense`, {
        amount,
        expense_name,
        description,
        created_at: created_at || new Date().toISOString().split('T')[0]
      })
      const { expense_added, message } = await response.data
      if (expense_added) {
        setExpenseAdded(true)
        setAlertMessage({ message: message, type: 'success' })
      } else {
        setAlertMessage({ message: message, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: error?.response.data.message ?? 'عفواً! فشل إضافة الخدمة حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  async function deleteExpense(serviceId: number) {
    try {
      const response = await axios.delete(
        `${API_URL}/expenses/delete_expense/${serviceId}`
      )
      const { expense_deleted, message } = await response.data
      if (expense_deleted) {
        setAlertMessage({ message: message, type: 'success' })
        setExpenseDeleted(true)
      } else {
        setAlertMessage({ message: message, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      setAlertMessage({
        message: 'عفواً! فشل حذف الإيراد حاول مرة أخرى!',
        type: 'error'
      })
    }
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${API_URL}/expenses`)
        const { rows: expenses } = await response.data
        setAllExpenses(expenses)
      } catch (error: any) {
        console.error('Error fetching expenses:', error.message)
      }
    }
    fetchExpenses()
  }, [expenseDeleted, expenseAdded])

  useEffect(() => {
    const handleSearch = () => {
      const query = searchQuery.toLowerCase()
      if (query.trim() === '') {
        setFilteredExpenses([])
        setTotalDisbursement(
          allExpenses.reduce((acc, curr: any) => acc + parseFloat(curr.amount), 0)
        )
        return
      }
      const filtered = allExpenses.filter(
        (expense: expensesType) =>
          expense.expense_name?.toLowerCase().includes(query) || // Check if expense_name exists
          expense.created_at?.toLowerCase().includes(query) || // Check if created_at exists
          arabicDate(expense.created_at)?.toLowerCase().includes(query) // Check if arabicDate(expense.created_at) exists
      )
      setFilteredExpenses(filtered)

      // Calculate total disbursement for searched month
      const total = filtered.reduce((acc, curr: any) => acc + parseFloat(curr.amount), 0)
      setTotalDisbursement(total)
    }

    handleSearch()
  }, [searchQuery, allExpenses])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div dir='rtl'>
      <h1>إدخال المصاريف</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='amount'>المبلغ:</label>
          <input
            type='text'
            id='amount'
            onChange={e => setAmount(e.target.value)}
            onKeyDown={onlyNumbers}
            required
          />
        </div>

        <div>
          <label htmlFor='expenseName'>ماهية المنصرف:</label>
          <input
            type='text'
            id='expenseName'
            onChange={e => setExpenseName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor='description'>شرح عن المبلغ:</label>
          <textarea id='description' onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <label htmlFor='description'>تاريخ المنصرف:</label>
          <input
            type='date'
            id='created_at'
            onChange={e => setCreated_at(e.target.value)}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button type='submit' disabled={expenseAdded}>
          إرسال
        </button>
        <HomeButton />
      </form>

      <div>
        <input
          type='text'
          placeholder='ابحث هنا ...'
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>

      {alertMessage.message && (
        <div className={`alert ${alertMessage.type}`}>{alertMessage.message}</div>
      )}

      <table dir='rtl'>
        <thead>
          <tr>
            <th>التسلسل</th>
            <th>اسم المنصرف</th>
            <th>المبلغ</th>
            <th>الوصف</th>
            <th>تاريخ المنصرف</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {!searchQuery
            ? allExpenses.map((expense: expensesType, index: number) => (
                <tr key={index}>
                  <td>{expense.id}</td>
                  <td>{expense.expense_name}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{arabicDate(expense.created_at)}</td>
                  <td>
                    <button
                      style={{ margin: 10 }}
                      onClick={() => {
                        confirm(
                          'هل أنت متأكد من حذف الإيراد؟ لا يمكن التراجع عن هذا القرار.'
                        ) && deleteExpense(expense.id)
                      }}
                      className='delete-btn'
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            : filteredExpenses.map((expense: expensesType, index: number) => (
                <tr key={index}>
                  <td>{expense.id}</td>
                  <td>{expense.expense_name}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{arabicDate(expense.created_at)}</td>
                  <td>
                    <button
                      style={{ margin: 10, marginBottom: 10 }}
                      onClick={() => {
                        confirm(
                          'هل أنت متأكد من حذف الإيراد؟ لا يمكن التراجع عن هذا القرار.'
                        ) && deleteExpense(expense.id)
                      }}
                      className='delete-btn'
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {totalDisbursement !== 0 && (
        <div>
          <p>إجمالي المصاريف: {totalDisbursement}</p>
        </div>
      )}

      <Link to='/dashboard' className='back-btn'>
        العودة
      </Link>
    </div>
  )
}
