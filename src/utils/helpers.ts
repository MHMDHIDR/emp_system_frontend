import axios from 'axios'
import { API_URL, DEFAULT_DURATION } from './constants'
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
 * A function to redirect to a new page
 * @param {string} url
 * @param {number} time
 * @returns void
 */
export const redirect = (url: any, time: number = DEFAULT_DURATION) =>
  window.location
    ? setTimeout(() => (window.location = url), time)
    : setTimeout(() => (window.location.replace = url), time)

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
export async function fetchAllEmployees(): Promise<empType[] | { error: any }> {
  try {
    const response = await axios.get(`${API_URL}/employees`)
    const { rows }: { rows: empType[] } = await response.data

    return rows
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
export const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers`)
    const { rows: customers }: { rows: customerType[] } = await response.data

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

    return { customersWithEmployeeName }
  } catch (error: any) {
    console.error('Error fetching customers:', error.message)
    return {
      message: error?.response.data.message ?? 'عفواً! فشل جلب بيانات العملاء!',
      type: 'error'
    }
  }
}

/**
 * Method to get all of the services in the system
 * @returns - list of services
 * */
export const fetchServices = async ({ customerId }: { customerId?: number }) => {
  try {
    const response = customerId
      ? await axios.get(`${API_URL}/services/byId/0?customerId=${customerId}`)
      : await axios.get(`${API_URL}/services`)
    const { rows: services }: { rows: serviceType[] } = await response.data

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

    return { servicesForCurrentEmployee }
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
): Promise<
  { service: serviceType; receipt: receiptsType | receiptsType[] | undefined } | undefined
> => {
  try {
    const receipt = (await fetchReceipts({ serviceId: id })) as receiptsType
    const response = await axios.get(`${API_URL}/services/byId/${id}`)
    const { rows: service } = response.data

    return { service, receipt }
  } catch (error: any) {
    console.error('Error fetching service by id:', error.message)
  }
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
 * Method to construct the receipt reference number based on the service id and the receipt id, and the current date
 * @param serviceId - the id of the service
 * @param receiptId - the id of the receipt
 * @returns - the reference number
 * */
export const constructReferenceNumber = (
  serviceId: number | number[],
  receiptId: number | number[]
): string => {
  const currentDate = new Date().toISOString().split('T')[0] // Format: "yyyy-MM-dd"

  if (Array.isArray(serviceId) && Array.isArray(receiptId)) {
    return `INV-${serviceId.join('-')}-${receiptId.join('-')}-${currentDate}`
  }

  return `INV-${serviceId}-${receiptId}-${currentDate}`
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
