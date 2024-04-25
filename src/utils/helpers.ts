import axios from 'axios'
import { API_URL } from './constants'
import {
  customerType,
  empType,
  getClientNameType,
  getEmployeeNameType,
  officeDetailsType,
  receiptsType,
  serviceType
} from '../types.js'

/**
 *  Method That Formats Date to Locale Date String
 * @param date  - date string to be formatted (e.g. 2021-08-01T12:00:00.000Z)
 * @returns   - formatted date string (e.g. Sunday, 1 August 2021, 13:00:00)
 */
export const arabicDate = (date: string, withTime: boolean = false) =>
  new Date(date).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: withTime ? 'numeric' : undefined,
    minute: withTime ? 'numeric' : undefined,
    second: withTime ? 'numeric' : undefined
  })

/**
 * Method to get arabic Role Name
 * @param role - role name to be translated
 * @returns - translated role name
 */
export const getArabicRole = (role: string) => {
  switch (role) {
    case 'admin':
      return 'مدير'
    case 'employee':
      return 'موظف'
    case 'accountant':
      return 'محاسب'
    default:
      return role
  }
}

/**
 * Method to get employee data using their id
 * @param id - employee id
 * @returns - employee data
 **/
export const getEmployeeData = async (id: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/employees/byId/${id}`)
    return data
  } catch (error: any) {
    console.error('Error fetching employee by id:', error.message)
  }
}

/**
 * Method to get customer data using their id
 * @param id - customer id
 * @returns - customer data
 **/
export const getCustomerData = async (id: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/customers/byId/${id}`)
    return data
  } catch (error: any) {
    console.error('Error fetching customer by id:', error.message)
  }
}

/**
 * Method to get all employees in the system
 * @returns - list of employees
 * */
export async function fetchAllEmployees(
  page?: number
): Promise<{ employees: empType[]; totalEmployees: number } | { error: any }> {
  try {
    const response = await axios.get(`${API_URL}/employees/${page ?? 1}`)
    const {
      rows: employees,
      totalEmployees
    }: {
      rows: empType[]
      totalEmployees: number
    } = await response?.data

    return { employees, totalEmployees }
  } catch (error: any) {
    console.error('Error logging in:', error.message)
    return { error }
  }
}

/**
 * Method to get all office details
 * @returns - list of office details
 */
export async function getAllOfficeDetails(): Promise<officeDetailsType[]> {
  try {
    const response = await axios.get(`${API_URL}/office-details`)
    const { rows }: { rows: officeDetailsType[] } = await response.data

    return rows
  } catch (error: any) {
    console.error('Error logging in:', error.message)
    throw new Error('عفواً! فشل جلب بيانات تفاصيل المكتب!')
  }
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] // Format: "yyyy-MM-dd"
}

/**
 * A function to get an employee name from the getEmployeeData that hits the enpoint API
 * @param empId
 * @returns Promise<{ employeeName: getEmployeeNameType; }>
 */
export const getEmployeeName = async (empId: number) => {
  let getEmployeeName: getEmployeeNameType = {
    name: '',
    isLoading: true
  }
  try {
    const empData: empType = await getEmployeeData(empId)
    getEmployeeName.name = empData.full_name
  } catch (error: any) {
    console.error('Error fetching employee name:', error.message)
  } finally {
    getEmployeeName.isLoading = false
  }

  return { employeeName: getEmployeeName }
}

/**
 * A function to get an client name from the getCustomerData that hits the enpoint API
 * @param customerId
 * @returns Promise<{ clientName: getClientNameType; }>
 */
export const getClientName = async (customerId: number) => {
  let getClientName: getClientNameType = {
    name: '',
    isLoading: true
  }
  try {
    const clientData: customerType = await getCustomerData(customerId)
    getClientName.name = clientData.client_name
  } catch (error: any) {
    console.error('Error fetching client name:', error.message)
  } finally {
    getClientName.isLoading = false
  }

  return { clientName: getClientName }
}

/**
 * Method to get all of the clients in the system
 * @returns - list of clients
 * */
export const fetchCustomers = async (currentEmpId: number, page?: number) => {
  try {
    const response = await axios.get(`${API_URL}/customers/${page ?? 1}`, {
      params: { currentEmpId }
    })
    const {
      rows: customers,
      totalCountRows: totalCustomers
    }: {
      rows: customerType[]
      totalCountRows: number
    } = await response?.data

    const customersWithEmployeeName = await Promise.all(
      customers.map(async client => {
        const { employeeName }: { employeeName: getEmployeeNameType } =
          await getEmployeeName(client.employee_id)
        const { clientName }: { clientName: getEmployeeNameType } = await getClientName(
          client.id
        )

        return { ...client, employeeName, clientName }
      })
    )

    return { customersWithEmployeeName, totalCustomers }
  } catch (error: any) {
    console.error('Error fetching customers:', error.message)
  }
}

/**
 * Method to get all of the services in the system
 * @returns - list of services
 * */
export const fetchServices = async (
  page: number,
  {
    customerId
  }: {
    customerId?: number
  }
) => {
  try {
    const response = customerId
      ? await axios.get(`${API_URL}/services/byId/${customerId}`)
      : await axios.get(`${API_URL}/services/${page}`)
    const {
      rows: services,
      totalServices
    }: { rows: serviceType[]; totalServices: number } = await response.data

    const servicesForCurrentEmployee = await Promise.all(
      services.map(async service => {
        const { employeeName }: { employeeName: getEmployeeNameType } =
          await getEmployeeName(service.employee_id)
        const receipts = (await fetchReceipts({
          serviceId: service.id
        })) as receiptsType[]
        const {
          employeeName: representativeName
        }: { employeeName: getEmployeeNameType } = !service.representative_id
          ? { employeeName: { name: 'لا يوجد', isLoading: false } }
          : await getEmployeeName(service.representative_id)

        return { ...service, employeeName, receipts, representativeName }
      })
    )

    return { servicesForCurrentEmployee, totalServices }
  } catch (error: any) {
    console.error('Error fetching services:', error.message)
    return {
      message: error?.response.data.message ?? 'عفواً! فشل جلب بيانات الخدمات!',
      type: 'error'
    }
  }
}

/**
 * Method to get service data using its id
 * @returns - service data
 * */
export const getServiceData = async (
  id: number
): Promise<{ service: serviceType; receipt: receiptsType | receiptsType[] }> => {
  try {
    const receipt = (await fetchReceipts({ serviceId: id })) as receiptsType
    const response = await axios.get(`${API_URL}/services/byId/${id}`)
    const { rows: service }: { rows: serviceType } = response.data

    return { service, receipt }
  } catch (error: any) {
    console.error('Error fetching service by id:', error.message)
  }
  return { service: {} as serviceType, receipt: {} as receiptsType }
}

/**
 * Method to get all paid amounts for a service
 * @returns - list of receipts
 */
export const fetchReceipts = async ({
  serviceId,
  customerId
}: {
  serviceId?: number
  customerId?: number
}): Promise<receiptsType[] | receiptsType> => {
  try {
    const response = serviceId
      ? await axios.get(`${API_URL}/receipts/byId/${serviceId}`)
      : customerId
      ? await axios.get(`${API_URL}/receipts/byId/0?customerId=${customerId}`)
      : await axios.get(`${API_URL}/receipts`)
    const { data: receipts } = response

    return serviceId || customerId
      ? (receipts as receiptsType[])
      : (receipts.rows as receiptsType[] | receiptsType)
  } catch (error: any) {
    console.error('Error fetching receipts:', error.message)
    throw error
  }
}

/**
 * Method to construct the receipt reference number based on the employee id and the receipt id, and the current date
 * @param employee_id - the id of the employee
 * @param receiptId - the id of the receipt
 * @returns - the reference number
 * */
export const constructReferenceNumber = (employee_id: number[], receiptId: number[]) => {
  const clientIds = Array.from(new Set(employee_id)).join('-')
  const receiptIds = Array.from(new Set(receiptId)).join('-')

  return `INV-${clientIds}-${receiptIds}`
}

/**
 * A function to format the price to the currency
 * @param price the price to be formatted
 * @returns the formatted price
 * */
export const formattedPrice = (price: number, maximumFractionDigits: number = 0) => {
  const formatter = new Intl.NumberFormat('ar-ae', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits
  })

  return formatter.format(price)
}

/**
 * A function to Only allow numbers for the input and allow the backspace and delete keys
 * @param e - the event object
 */
export const onlyNumbers = (e: { key: string; preventDefault: () => void }) => {
  //allow the backspace and delete keys for the input
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown'
  ]
  if (allowedKeys.includes(e.key)) return
  //only allow numbers for the input
  if (isNaN(Number(e.key))) e.preventDefault()
}
