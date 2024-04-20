export type empType = {
  id: number
  employee_id: number
  username: string
  role: 'admin' | 'employee' | 'accountant' | 'representative'
  full_name: string
  login_time: string
  logout_time: string
  start_working_date: string
  final_working_date: string
  contract_end_date: string
  residency_end_date: string
  nationality: string
  passport_id_number: number
  personal_id_number: string
  salary_amount: string
  comission_percentage: number
}

export type customerType = {
  id: number
  employee_id: number
  client_name: string
  created_at: string
  nationality: string
  phone_number: number
  customer_credentials: customerCredentialsType[]
  email: string
  job_title: string
  office_discovery_method: string
  employeeName?: getEmployeeNameType
}

export type expensesType = {
  id: number
  amount: number
  expense_name: string
  description: string
  created_at: string
  expense_added: boolean
  expense_deleted: boolean
  message: string
}

export type serviceType = {
  id: number
  employee_id: number
  representative_id: number
  employeeName?: getEmployeeNameType
  ClientName?: getEmployeeNameType
  representativeName?: getEmployeeNameType
  client_id: number
  service_name: string
  service_total_price: number
  service_payment_status: 'paid' | 'unpaid' | 'partially-paid'
  service_status: 'not-started' | 'in-process' | 'completed'
  created_at: string
  ends_at: string
  service_details: string
  receipts: receiptsType[]
  sub_services: subServicesType[]
}

export type receiptsType = {
  selected: boolean
  receipt_id: number
  /** العميل اللي اخذ الخدمة */
  client_id: customerType['id']
  client_name: customerType['client_name']
  /** لإسترجاع بيانات الخدمة نفسها */
  service_id: serviceType['id']
  service_name: serviceType['service_name']
  service_paid_amount: number
  service_remaining_amount: number
  service_total_price: number
  /** الموظف اللي اضاف الخدمة */
  employee_id: number
  full_name: empType['full_name']
  created_at: string
}

export type officeDetailsType = {
  office_id: number
  ar_office_name: string
  en_office_name: string
  ar_office_address: string
  en_office_address: string
  office_email: string
  office_tax_number: number
  office_phone: string
}

export type getEmployeeNameType = {
  name: string
  isLoading: boolean
}

export type customerCredentialsType = {
  id: number
  websiteName: string
  username: string
  password: string
}

export type subServicesType = {
  id: number
  service_details: string
  service_date: string
}

export type getClientNameType = getEmployeeNameType

export type currentEmpolyeeType = {
  id: empType['employee_id']
  name: empType['full_name']
  role: empType['role']
}

export type serviceModeType = 'add' | 'edit' | 'view'
