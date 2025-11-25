// Dummy Data Service - Replaces all backend API calls

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Dummy users for login
const dummyUsers = [
  { username: 'kotakadmin', password: 'Admin1234', role: 'admin', name: 'Kotak Admin' },
  { username: 'pradeepr', password: 'Sonata123@', role: 'supervisor', name: 'Supervisor User' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'Staff User' },
  { username: 'user', password: 'user123', role: 'user', name: 'Regular User' },
  { username: 'manager', password: 'manager123', role: 'manager', name: 'Manager User' },
]

// Login API replacement
export async function loginApi({ username, password }) {
  await delay(800)
  
  const user = dummyUsers.find(u => u.username === username && u.password === password)
  
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  return {
    username: user.username,
    role: user.role,
    tokens: {
      access: `dummy_access_token_${user.username}_${Date.now()}`,
      refresh: `dummy_refresh_token_${user.username}_${Date.now()}`
    }
  }
}

// Logout API replacement
export async function logoutApi(accessToken) {
  await delay(300)
  return { message: 'Logged out successfully' }
}

// Generate random number in range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => Math.random() * (max - min) + min

// Generate date range
const generateDateRange = (fromDate, toDate) => {
  const dates = []
  const start = new Date(fromDate)
  const end = new Date(toDate)
  const current = new Date(start)
  
  while (current <= end) {
    dates.push(new Date(current).toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Dashboard API replacement
export async function dashboardApi(accessToken) {
  await delay(600)
  
  const totalCases = random(75000, 120000)
  const activeCases = random(45000, 70000)
  const resolvedCases = random(30000, 50000)
  
  return {
    total_cases: totalCases,
    active_cases: activeCases,
    resolved_cases: resolvedCases,
    total_collection: random(800000000, 2500000000),
    today_collection: random(10000000, 60000000),
    monthly_collection: random(200000000, 800000000),
    collection_efficiency: randomFloat(70, 95),
    staff_count: random(150, 600),
    active_staff: random(120, 550),
    pending_allocations: random(2000, 8000),
    completed_allocations: random(8000, 30000)
  }
}

// Dashboard Collection Graph API replacement
export async function dashboardCollectionGraphApi(accessToken, fromDate, toDate) {
  await delay(500)
  
  const dates = generateDateRange(fromDate || '2025-01-01', toDate || '2025-12-30')
  const day = dates.map(d => d.split('-')[2] + '-' + d.split('-')[1])
  const collection = dates.map(() => random(1000000, 10000000))
  const target = dates.map(() => random(8000000, 12000000))
  
  return {
    from_date: fromDate || '2025-01-01',
    to_date: toDate || '2025-12-30',
    day,
    collection,
    target
  }
}

// Dashboard Deposition API replacement
export async function dashboardDepositionApi(accessToken, fromDate, toDate, page = 1, pageSize = 20) {
  await delay(500)
  
  const totalRecords = random(200, 800)
  const totalPages = Math.ceil(totalRecords / pageSize)
  const actualPageSize = page === totalPages ? (totalRecords % pageSize || pageSize) : pageSize
  
  const depositions = Array.from({ length: actualPageSize }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
    case_id: `CASE${String((page - 1) * pageSize + i + 1).padStart(6, '0')}`,
    customer_name: `Customer ${(page - 1) * pageSize + i + 1}`,
    amount: random(75000, 750000),
    date: new Date(Date.now() - random(1, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['Pending', 'Completed', 'In Progress'][random(0, 2)],
    loan_type: ['Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment'][random(0, 3)],
    dpd: random(1, 180),
    branch: `Branch ${random(1, 50)}`,
    staff_name: `Staff ${random(1, 100)}`
  }))
  
  return {
    depositions,
    pagination: {
      current_page: page,
      page_size: pageSize,
      total_count: totalRecords,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1
    }
  }
}

// Dashboard Data API replacement
export async function dashboardDataApi(accessToken, reportType, fromDate, toDate) {
  await delay(500)
  
  const reportTypes = {
    'ftd': {
      title: 'FTD Summary',
      data: {
        total_cases: random(10000, 50000),
        total_outstanding: random(500000000, 2000000000),
        collection_amount: random(100000000, 800000000),
        efficiency: randomFloat(60, 95)
      }
    },
    'mtd': {
      title: 'MTD Summary',
      data: {
        total_cases: random(15000, 60000),
        total_outstanding: random(600000000, 2500000000),
        collection_amount: random(150000000, 1000000000),
        efficiency: randomFloat(65, 95)
      }
    },
    'ytd': {
      title: 'YTD Summary',
      data: {
        total_cases: random(50000, 200000),
        total_outstanding: random(2000000000, 10000000000),
        collection_amount: random(500000000, 5000000000),
        efficiency: randomFloat(70, 95)
      }
    }
  }
  
  return reportTypes[reportType] || reportTypes['ftd']
}

// Dashboard Collection Data API replacement
export async function dashboardCollectionDataApi(accessToken, reportType, fromDate, toDate) {
  await delay(500)
  
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh']
  const regions = ['North', 'South', 'East', 'West', 'Central']
  const buckets = ['0-30', '31-60', '61-90', '91-120', '121-180', '180+']
  
  if (reportType === 'collection state wise summary') {
    return {
      report_type: reportType,
      data: states.map(state => ({
        state,
        total_cases: random(2000, 15000),
        total_outstanding: random(80000000, 800000000),
        collection_amount: random(20000000, 300000000),
        efficiency: randomFloat(65, 95),
        dpd_avg: random(35, 130)
      }))
    }
  }
  
  if (reportType === 'collection region wise summary') {
    return {
      report_type: reportType,
      data: regions.map(region => ({
        region,
        total_cases: random(8000, 40000),
        total_outstanding: random(300000000, 3000000000),
        collection_amount: random(80000000, 1200000000),
        efficiency: randomFloat(68, 96),
        dpd_avg: random(30, 115)
      }))
    }
  }
  
  if (reportType === 'collection bucket wise summary') {
    return {
      report_type: reportType,
      data: buckets.map(bucket => ({
        bucket,
        total_cases: random(3000, 25000),
        total_outstanding: random(150000000, 1500000000),
        collection_amount: random(30000000, 600000000),
        efficiency: randomFloat(55, 92),
        percentage: randomFloat(8, 30)
      }))
    }
  }
  
  // Default return with some data
  return {
    report_type: reportType,
    data: states.slice(0, 3).map(state => ({
      state,
      total_cases: random(2000, 15000),
      total_outstanding: random(80000000, 800000000),
      collection_amount: random(20000000, 300000000),
      efficiency: randomFloat(65, 95),
      dpd_avg: random(35, 130)
    }))
  }
}

// Admin Users API replacement - Matching screenshot data
const generateDummyUsers = () => {
  // Base users matching the screenshot
  const baseUsers = [
    {
      id: 1,
      username: 'Pranav_Admin',
      first_name: 'Pranav',
      last_name: 'Daundkar',
      name: 'Pranav Daundkar',
      email: 'pranavdaundkar13@gmail.com',
      mobile_number: '8329268591',
      role: 'admin',
      is_active: true,
      created_by: 'admin',
      created_at: new Date('2025-11-14T04:49:00').toISOString(),
      creation_date: new Date('2025-11-14T04:49:00').toISOString()
    },
    {
      id: 2,
      username: 'AdminVishal',
      first_name: 'Vishal',
      last_name: 'Markad',
      name: 'Vishal Markad',
      email: 'vishalmarkad2020@gmail.com',
      mobile_number: '7499028909',
      role: 'admin',
      is_active: true,
      created_by: 'admin',
      created_at: new Date('2025-11-13T09:32:00').toISOString(),
      creation_date: new Date('2025-11-13T09:32:00').toISOString()
    },
    {
      id: 3,
      username: 'pranav_test',
      first_name: 'pranav_1',
      last_name: 'daundkar',
      name: 'pranav_1 daundkar',
      email: 'test@gmail.com',
      mobile_number: '111111111',
      role: 'admin',
      is_active: true,
      created_by: 'admin',
      created_at: new Date('2025-11-10T18:07:00').toISOString(),
      creation_date: new Date('2025-11-10T18:07:00').toISOString()
    },
    {
      id: 4,
      username: 'UC_Pranav',
      first_name: 'Admin',
      last_name: 'User',
      name: 'Admin User',
      email: 'pranavdaundkar13@gmail.com',
      mobile_number: '8329268591',
      role: 'Admin',
      is_active: true,
      created_by: 'System',
      created_at: new Date('2025-11-07T16:23:00').toISOString(),
      creation_date: new Date('2025-11-07T16:23:00').toISOString()
    },
    {
      id: 5,
      username: 'UC_Vishal',
      first_name: 'Admin',
      last_name: 'User',
      name: 'Admin User',
      email: 'pranavdaundkar13@gmail.com',
      mobile_number: '8329268591',
      role: 'Admin',
      is_active: true,
      created_by: 'System',
      created_at: new Date('2025-11-07T16:12:00').toISOString(),
      creation_date: new Date('2025-11-07T16:12:00').toISOString()
    },
    {
      id: 6,
      username: 'KMBL364105',
      first_name: 'Harichandra',
      last_name: 'Vaghela',
      name: 'Harichandra Vaghela',
      email: 'harichandra.vaghela1@kotak.com',
      mobile_number: '7698388680',
      role: 'DTR',
      is_active: true,
      created_by: 'KMBL351969',
      created_at: new Date('2025-09-30T13:14:00').toISOString(),
      creation_date: new Date('2025-09-30T13:14:00').toISOString()
    },
    {
      id: 7,
      username: 'KMBL364854',
      first_name: 'Rupal',
      last_name: 'Vasania',
      name: 'Rupal Vasania',
      email: '-',
      mobile_number: '9322260171',
      role: 'Audit',
      is_active: true,
      created_by: 'KMBL351969',
      created_at: new Date('2025-09-30T13:14:00').toISOString(),
      creation_date: new Date('2025-09-30T13:14:00').toISOString()
    }
  ]

  // Generate additional users to reach 10129 total
  const additionalCount = 10129 - baseUsers.length
  const roles = ['admin', 'Admin', 'DTR', 'Audit', 'staff', 'user', 'manager', 'supervisor', 'collector']
  const firstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita', 'Suresh', 'Meera', 'Kiran', 'Deepak', 'Sunita', 'Ramesh']
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Nair', 'Desai', 'Joshi', 'Iyer', 'Menon', 'Rao', 'Shetty', 'Kamath']
  
  const additionalUsers = Array.from({ length: additionalCount }, (_, i) => {
    const firstName = firstNames[random(0, firstNames.length - 1)]
    const lastName = lastNames[random(0, lastNames.length - 1)]
    const username = `KMBL${random(300000, 400000)}`
    
    return {
      id: baseUsers.length + i + 1,
      username,
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`,
      email: `${username.toLowerCase()}@kotak.com`,
      mobile_number: `9${random(100000000, 999999999)}`,
      role: roles[random(0, roles.length - 1)],
      is_active: random(0, 10) > 2,
      created_by: random(0, 5) > 3 ? 'admin' : `KMBL${random(300000, 400000)}`,
      created_at: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
      creation_date: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  return [...baseUsers, ...additionalUsers]
}

export async function adminGetUsers(accessToken, page = 1, pageSize = 50) {
  await delay(500)
  
  const totalUsers = 10129
  const allUsers = generateDummyUsers()
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, allUsers.length)
  const users = allUsers.slice(startIndex, endIndex)
  
  return {
    users: users,
    pagination: {
      current_page: page,
      page_size: pageSize,
      total_count: totalUsers,
      total_pages: Math.ceil(totalUsers / pageSize),
      has_next: endIndex < allUsers.length,
      has_previous: page > 1
    }
  }
}

export async function adminCreateUser(accessToken, userData) {
  await delay(600)
  return {
    message: 'User created successfully',
    user: {
      id: random(1000, 9999),
      ...userData,
      created_at: new Date().toISOString()
    }
  }
}

export async function adminUpdateUser(accessToken, username, userData) {
  await delay(600)
  return {
    message: 'User updated successfully',
    user: {
      username,
      ...userData,
      updated_at: new Date().toISOString()
    }
  }
}

export async function adminDeleteUser(accessToken, username) {
  await delay(400)
  return {
    message: 'User deactivated successfully'
  }
}

// Admin Dashboard Stats API replacement
export async function adminGetDashboardStats(accessToken) {
  await delay(500)
  
  const totalUsers = random(200, 400)
  const activeUsers = random(150, totalUsers - 20)
  const inactiveUsers = totalUsers - activeUsers
  
  return {
    total_users: totalUsers,
    active_users: activeUsers,
    inactive_users: inactiveUsers > 0 ? inactiveUsers : random(10, 30),
    recent_logins_24h: random(80, 250)
  }
}

// Admin Activity Logs API replacement - Matching screenshot data
export async function adminGetActivityLogs(accessToken) {
  await delay(500)
  
  // Base logs matching the screenshot
  const baseLogs = [
    {
      id: 1,
      username: 'AdminVishal',
      login_time: new Date('2025-11-25T06:43:06').toISOString(),
      logout_time: null,
      status: 'Active'
    },
    {
      id: 2,
      username: 'AdminVishal',
      login_time: new Date('2025-11-25T06:41:23').toISOString(),
      logout_time: new Date('2025-11-25T06:42:54').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 3,
      username: 'pradeepr',
      login_time: new Date('2025-11-25T06:06:51').toISOString(),
      logout_time: new Date('2025-11-25T06:27:51').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 4,
      username: 'pradeepr',
      login_time: new Date('2025-11-25T04:58:22').toISOString(),
      logout_time: new Date('2025-11-25T05:33:22').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 5,
      username: 'pradeepr',
      login_time: new Date('2025-11-25T04:41:19').toISOString(),
      logout_time: new Date('2025-11-25T04:57:23').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 6,
      username: 'pradeepr',
      login_time: new Date('2025-11-24T12:56:47').toISOString(),
      logout_time: new Date('2025-11-25T04:41:19').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 7,
      username: 'pradeepr',
      login_time: new Date('2025-11-24T12:26:03').toISOString(),
      logout_time: new Date('2025-11-24T12:41:18').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 8,
      username: 'pradeepr',
      login_time: new Date('2025-11-24T11:52:05').toISOString(),
      logout_time: new Date('2025-11-24T12:09:36').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 9,
      username: 'pradeepr',
      login_time: new Date('2025-11-24T09:02:55').toISOString(),
      logout_time: new Date('2025-11-24T11:52:04').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 10,
      username: 'pradeepr',
      login_time: new Date('2025-11-24T07:33:59').toISOString(),
      logout_time: new Date('2025-11-24T08:58:13').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 11,
      username: 'pradeepr',
      login_time: new Date('2025-11-21T09:10:56').toISOString(),
      logout_time: new Date('2025-11-21T09:39:24').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 12,
      username: 'pradeepr',
      login_time: new Date('2025-11-21T07:06:25').toISOString(),
      logout_time: new Date('2025-11-21T09:10:56').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 13,
      username: 'AdminVishal',
      login_time: new Date('2025-11-21T06:56:06').toISOString(),
      logout_time: new Date('2025-11-21T07:06:20').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 14,
      username: 'pradeepr',
      login_time: new Date('2025-11-21T06:39:43').toISOString(),
      logout_time: new Date('2025-11-21T07:06:25').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 15,
      username: 'pradeepr',
      login_time: new Date('2025-11-21T06:20:10').toISOString(),
      logout_time: new Date('2025-11-21T06:39:43').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 16,
      username: 'Pranav_Admin',
      login_time: new Date('2025-11-21T06:09:20').toISOString(),
      logout_time: new Date('2025-11-21T06:20:01').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 17,
      username: 'AdminVishal',
      login_time: new Date('2025-11-21T06:02:45').toISOString(),
      logout_time: new Date('2025-11-21T06:19:50').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 18,
      username: 'Pranav_Admin',
      login_time: new Date('2025-11-21T06:00:15').toISOString(),
      logout_time: new Date('2025-11-21T06:09:20').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 19,
      username: 'Pranav_Admin',
      login_time: new Date('2025-11-21T05:30:58').toISOString(),
      logout_time: new Date('2025-11-21T06:00:15').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 20,
      username: 'Pranav_Admin',
      login_time: new Date('2025-11-21T04:47:46').toISOString(),
      logout_time: new Date('2025-11-21T05:27:13').toISOString(),
      status: 'SessionTimeout'
    },
    {
      id: 21,
      username: 'AdminVishal',
      login_time: new Date('2025-11-20T12:44:34').toISOString(),
      logout_time: new Date('2025-11-21T06:02:45').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 22,
      username: 'pradeepr',
      login_time: new Date('2025-11-20T12:44:24').toISOString(),
      logout_time: new Date('2025-11-20T12:44:28').toISOString(),
      status: 'LoggedOut'
    },
    {
      id: 23,
      username: 'pradeepr',
      login_time: new Date('2025-11-20T10:46:01').toISOString(),
      logout_time: new Date('2025-11-20T11:38:44').toISOString(),
      status: 'SessionTimeout'
    }
  ]

  // Generate additional logs
  const additionalCount = random(50, 150)
  const users = ['AdminVishal', 'pradeepr', 'Pranav_Admin', 'kotakadmin', 'staff1', 'user1', 'manager1']
  const statuses = ['Active', 'LoggedOut', 'SessionTimeout']
  
  const additionalLogs = Array.from({ length: additionalCount }, (_, i) => {
    const loginTime = new Date(Date.now() - random(1, 30) * 24 * 60 * 60 * 1000 - random(1, 86400000))
    const logoutTime = random(0, 10) > 2 ? new Date(loginTime.getTime() + random(10, 1440) * 60 * 1000) : null
    const status = logoutTime ? (random(0, 10) > 5 ? 'LoggedOut' : 'SessionTimeout') : 'Active'
    
    return {
      id: baseLogs.length + i + 1,
      username: users[random(0, users.length - 1)],
      login_time: loginTime.toISOString(),
      logout_time: logoutTime ? logoutTime.toISOString() : null,
      status: status
    }
  })

  const allLogs = [...baseLogs, ...additionalLogs]
  
  return {
    logs: allLogs.sort((a, b) => new Date(b.login_time) - new Date(a.login_time)),
    total_count: allLogs.length
  }
}

// Admin Today Uploaded Files API replacement
export async function adminGetTodayUploadedFiles(accessToken) {
  await delay(400)
  
  const fileCount = random(8, 25)
  const files = Array.from({ length: fileCount }, (_, i) => ({
    id: i + 1,
    filename: `upload_${new Date().toISOString().split('T')[0]}_${i + 1}.csv`,
    uploaded_by: `user${random(1, 20)}`,
    uploaded_at: new Date(Date.now() - random(1, 86400000)).toISOString(),
    file_size: random(200000, 8000000),
    status: ['Completed', 'Processing', 'Failed'][random(0, 2)],
    records_count: random(500, 15000)
  }))
  
  return { files }
}

// Admin Maintenance Status API replacement
export async function adminGetMaintenanceStatus(accessToken) {
  await delay(200)
  const maintenance = localStorage.getItem('maintenanceMode')
  return { is_maintenance_mode: maintenance === 'true' }
}

export async function adminSetMaintenanceMode(accessToken, enabled) {
  await delay(200)
  localStorage.setItem('maintenanceMode', enabled.toString())
  return { success: true, is_maintenance_mode: enabled }
}

// Admin Allocation Details API replacement - Matching screenshot data
export async function adminGetAllocationDetails(accessToken) {
  await delay(500)
  
  // Base allocations matching the screenshot
  const baseAllocations = [
    {
      id: 1,
      as_on_date: '2025-10-20',
      case_id: '7448777',
      apac_card_number: 'SA1097847',
      party_name: 'Shamsul Qamar',
      vertical: 'SA',
      product: 'U_AST_FIN - Used Asset Finance',
      city: 'AMROHA',
      state: 'Uttar Pradesh',
      pincode: '244222',
      dpd: 0,
      allocated_by_username: 'KMBL356475',
      allocated_to_username: 'KMBL357346',
      allocated_on: '2025-11-20 12:57:01'
    },
    {
      id: 2,
      as_on_date: '2025-10-20',
      case_id: '7444058',
      apac_card_number: 'SA1005802',
      party_name: 'Ajeem Khan',
      vertical: 'SA',
      product: 'U_AST_FIN - Used Asset Finance',
      city: 'RAMPUR',
      state: 'Uttar Pradesh',
      pincode: '244925',
      dpd: 0,
      allocated_by_username: 'KMBL356475',
      allocated_to_username: 'KMBL304443',
      allocated_on: '2025-10-20 13:13:20'
    },
    {
      id: 3,
      as_on_date: '2025-10-20',
      case_id: '6991782',
      apac_card_number: 'SA1148588',
      party_name: 'Shamshul Haq Qureshi',
      vertical: 'SA',
      product: 'U_AST_FIN - Used Asset Finance',
      city: 'BAREILLY',
      state: 'Uttar Pradesh',
      pincode: '243123',
      dpd: 0,
      allocated_by_username: 'KMBL356475',
      allocated_to_username: 'KMBL336949',
      allocated_on: '2025-10-20 13:13:20'
    },
    {
      id: 4,
      as_on_date: '2025-10-20',
      case_id: '7953535',
      apac_card_number: 'SA1240643',
      party_name: 'Sageer Ahmad',
      vertical: 'SA',
      product: 'REFIN - Refinance',
      city: 'RAMPUR',
      state: 'Uttar Pradesh',
      pincode: '244927',
      dpd: 0,
      allocated_by_username: 'KMBL356475',
      allocated_to_username: 'KMBL347804',
      allocated_on: '2025-10-20 13:13:20'
    },
    {
      id: 5,
      as_on_date: '2025-10-20',
      case_id: '23655008',
      apac_card_number: 'SA1474663',
      party_name: 'Harpal Singh Sethi',
      vertical: 'SA',
      product: 'REFIN - Refinance',
      city: 'NAINITAL_',
      state: 'Uttaranchal',
      pincode: '263139',
      dpd: 0,
      allocated_by_username: 'KMBL356475',
      allocated_to_username: 'KMBL348691',
      allocated_on: '2025-10-20 13:13:20'
    }
  ]

  // Generate additional allocations to reach 18 total
  const additionalCount = 18 - baseAllocations.length
  const products = ['U_AST_FIN - Used Asset Finance', 'REFIN - Refinance', 'Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment']
  const cities = ['AMROHA', 'RAMPUR', 'BAREILLY', 'NAINITAL_', 'LUCKNOW', 'KANPUR', 'AGRA', 'VARANASI']
  const states = ['Uttar Pradesh', 'Uttaranchal', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu']
  const verticals = ['SA', 'CV', 'CE', 'TR']
  
  const additionalAllocations = Array.from({ length: additionalCount }, (_, i) => {
    const caseId = random(6000000, 25000000)
    const apacCard = `SA${random(1000000, 2000000)}`
    const partyNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Singh', 'Vikram Gupta', 'Anjali Verma']
    const partyName = partyNames[random(0, partyNames.length - 1)]
    
    return {
      id: baseAllocations.length + i + 1,
      as_on_date: '2025-10-20',
      case_id: String(caseId),
      apac_card_number: apacCard,
      party_name: partyName,
      vertical: verticals[random(0, verticals.length - 1)],
      product: products[random(0, products.length - 1)],
      city: cities[random(0, cities.length - 1)],
      state: states[random(0, states.length - 1)],
      pincode: String(random(100000, 999999)),
      dpd: random(0, 30),
      allocated_by_username: `KMBL${random(350000, 360000)}`,
      allocated_to_username: `KMBL${random(300000, 350000)}`,
      allocated_on: `2025-10-20 ${String(random(10, 18)).padStart(2, '0')}:${String(random(10, 59)).padStart(2, '0')}:${String(random(10, 59)).padStart(2, '0')}`
    }
  })

  const allAllocations = [...baseAllocations, ...additionalAllocations]
  
  return { 
    allocations: allAllocations,
    summary: {
      total_cases: 18,
      unique_parties: 18,
      unique_collectors: 12,
      unique_verticals: 4
    }
  }
}

export async function adminUpdateAllocationDetails(accessToken, caseId, allocatedByUsername, allocatedToUsername) {
  await delay(500)
  return {
    message: 'Allocation updated successfully',
    allocation: {
      case_id: caseId,
      allocated_by_username: allocatedByUsername,
      allocated_to_username: allocatedToUsername,
      updated_at: new Date().toISOString()
    }
  }
}

// Admin Bulk Upload CSV API replacement
export async function adminBulkUploadCSV(accessToken, file) {
  await delay(1500)
  
  const recordsProcessed = random(500, 8000)
  const recordsSuccessful = random(recordsProcessed * 0.85, recordsProcessed * 0.98)
  const recordsFailed = recordsProcessed - recordsSuccessful
  
  return {
    message: 'File uploaded successfully',
    filename: file.name,
    records_processed: recordsProcessed,
    records_successful: Math.floor(recordsSuccessful),
    records_failed: Math.floor(recordsFailed) > 0 ? Math.floor(recordsFailed) : random(1, 50),
    uploaded_at: new Date().toISOString()
  }
}

// Activity Summary API replacement (used in UserActivitySummary) - Matching screenshot data
export async function getActivitySummary(accessToken, username, fromDate, toDate) {
  await delay(500)
  
  // Activity Summary data matching screenshot
  const activitySummary = [
    {
      username: 'AdminVishal',
      first_login: new Date('2025-11-25T12:10:51').toISOString(),
      last_login: new Date('2025-11-25T12:16:56').toISOString(),
      active_time_seconds: 2130, // 0h 35m 30s
      inactive_duration_seconds: 41, // 0h 0m 41s
      page_visits: 0,
      api_calls: 72,
      most_visited_page: 'admin/dashboard',
      status: 'Active',
      last_logout_time: new Date('2025-11-25T06:42:54').toISOString()
    },
    {
      username: 'pradeepr',
      first_login: new Date('2025-11-25T10:10:47').toISOString(),
      last_login: new Date('2025-11-25T12:14:07').toISOString(),
      active_time_seconds: 4140, // 1h 9m 0s
      inactive_duration_seconds: 183, // 0h 3m 3s
      page_visits: 0,
      api_calls: 142,
      most_visited_page: 'dashboard',
      status: 'Active',
      last_logout_time: new Date('2025-11-25T06:27:51').toISOString()
    }
  ]

  // Most Visited Sections data matching screenshot
  const sectionVisits = [
    {
      section_name: 'dashboard',
      backend_name: 'N/A',
      total_visits: 79,
      total_time_spent_seconds: 8951, // 2h 29m 11s
      last_visit_time: new Date('2025-11-25T12:14:07').toISOString()
    },
    {
      section_name: 'login',
      backend_name: 'N/A',
      total_visits: 29,
      total_time_spent_seconds: 117, // 0h 1m 57s
      last_visit_time: new Date('2025-11-25T12:14:07').toISOString()
    },
    {
      section_name: 'admin/dashboard',
      backend_name: 'N/A',
      total_visits: 15,
      total_time_spent_seconds: 306, // 0h 5m 6s
      last_visit_time: new Date('2025-11-25T12:14:05').toISOString()
    },
    {
      section_name: 'admin/users',
      backend_name: 'N/A',
      total_visits: 12,
      total_time_spent_seconds: 268, // 0h 4m 28s
      last_visit_time: new Date('2025-11-25T12:16:14').toISOString()
    },
    {
      section_name: 'admin/activity-logs',
      backend_name: 'N/A',
      total_visits: 8,
      total_time_spent_seconds: 64, // 0h 1m 4s
      last_visit_time: new Date('2025-11-25T12:16:55').toISOString()
    },
    {
      section_name: 'admin/activity-summary',
      backend_name: 'N/A',
      total_visits: 6,
      total_time_spent_seconds: 12, // 0h 0m 12s
      last_visit_time: new Date('2025-11-25T12:16:55').toISOString()
    },
    {
      section_name: 'admin/users/add',
      backend_name: 'N/A',
      total_visits: 6,
      total_time_spent_seconds: 8, // 0h 0m 8s
      last_visit_time: new Date('2025-11-25T12:16:16').toISOString()
    },
    {
      section_name: 'home',
      backend_name: 'N/A',
      total_visits: 1,
      total_time_spent_seconds: 0, // 0h 0m 0s
      last_visit_time: new Date('2025-11-25T11:57:20').toISOString()
    }
  ]

  // Filter by username if provided
  let filteredSummary = activitySummary
  if (username) {
    filteredSummary = activitySummary.filter(s => s.username.toLowerCase().includes(username.toLowerCase()))
  }

  return {
    activity_summary: filteredSummary,
    section_visits: sectionVisits,
    period: {
      from_date: fromDate || '2025-01-01',
      to_date: toDate || new Date().toISOString().split('T')[0]
    }
  }
}

// System Settings API replacement
let systemSettings = [
  {
    setting_key: 'SESSION_TIMEOUT_MINUTES',
    setting_value: '15',
    data_type: 'INTEGER',
    setting_description: 'Session timeout in minutes'
  },
  {
    setting_key: 'ACTIVITY_TRACKING_ENABLED',
    setting_value: 'true',
    data_type: 'BOOLEAN',
    setting_description: 'Enable activity tracking'
  },
  {
    setting_key: 'ACTIVITY_TRACKING_INTERVAL_SECONDS',
    setting_value: '30',
    data_type: 'INTEGER',
    setting_description: 'Activity tracking interval in seconds'
  },
  {
    setting_key: 'MAX_LOGIN_ATTEMPTS',
    setting_value: '5',
    data_type: 'INTEGER',
    setting_description: 'Maximum login attempts before lockout'
  },
  {
    setting_key: 'PASSWORD_MIN_LENGTH',
    setting_value: '8',
    data_type: 'INTEGER',
    setting_description: 'Minimum password length'
  },
  {
    setting_key: 'ENABLE_EMAIL_NOTIFICATIONS',
    setting_value: 'true',
    data_type: 'BOOLEAN',
    setting_description: 'Enable email notifications'
  }
]

export async function getSystemSettings(accessToken) {
  await delay(400)
  return { settings: systemSettings }
}

export async function updateSystemSetting(accessToken, settingKey, settingValue) {
  await delay(300)
  
  const setting = systemSettings.find(s => s.setting_key === settingKey)
  if (setting) {
    setting.setting_value = settingValue
  } else {
    systemSettings.push({
      setting_key: settingKey,
      setting_value: settingValue,
      data_type: 'STRING',
      setting_description: ''
    })
  }
  
  return { message: 'Setting updated successfully', setting: setting || systemSettings[systemSettings.length - 1] }
}

// Activity tracking API replacement (for useActivityTracker)
export async function trackSectionVisit(accessToken, sectionName, sectionBackendName, sectionId, timeSpent) {
  await delay(200)
  // Just log to console in dummy mode
  console.log('Section visit tracked:', { sectionName, sectionBackendName, sectionId, timeSpent })
  return { success: true }
}

