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
  
  return {
    total_cases: random(50000, 100000),
    active_cases: random(30000, 50000),
    resolved_cases: random(20000, 40000),
    total_collection: random(500000000, 2000000000),
    today_collection: random(5000000, 50000000),
    monthly_collection: random(100000000, 500000000),
    collection_efficiency: randomFloat(65, 95),
    staff_count: random(100, 500),
    active_staff: random(80, 450),
    pending_allocations: random(1000, 5000),
    completed_allocations: random(5000, 20000)
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
  
  const totalRecords = random(100, 500)
  const totalPages = Math.ceil(totalRecords / pageSize)
  
  const depositions = Array.from({ length: pageSize }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
    case_id: `CASE${String((page - 1) * pageSize + i + 1).padStart(6, '0')}`,
    customer_name: `Customer ${i + 1}`,
    amount: random(50000, 500000),
    date: new Date(Date.now() - random(0, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['Pending', 'Completed', 'In Progress'][random(0, 2)],
    loan_type: ['Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment'][random(0, 3)],
    dpd: random(0, 180),
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
        total_cases: random(1000, 10000),
        total_outstanding: random(50000000, 500000000),
        collection_amount: random(10000000, 200000000),
        efficiency: randomFloat(60, 95),
        dpd_avg: random(30, 120)
      }))
    }
  }
  
  if (reportType === 'collection region wise summary') {
    return {
      report_type: reportType,
      data: regions.map(region => ({
        region,
        total_cases: random(5000, 30000),
        total_outstanding: random(200000000, 2000000000),
        collection_amount: random(50000000, 800000000),
        efficiency: randomFloat(65, 95),
        dpd_avg: random(25, 110)
      }))
    }
  }
  
  if (reportType === 'collection bucket wise summary') {
    return {
      report_type: reportType,
      data: buckets.map(bucket => ({
        bucket,
        total_cases: random(2000, 20000),
        total_outstanding: random(100000000, 1000000000),
        collection_amount: random(20000000, 400000000),
        efficiency: randomFloat(50, 90),
        percentage: randomFloat(5, 25)
      }))
    }
  }
  
  return { report_type: reportType, data: [] }
}

// Admin Users API replacement
const generateDummyUsers = (count = 50) => {
  const roles = ['admin', 'staff', 'user', 'manager']
  const firstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita', 'Suresh', 'Meera']
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Nair', 'Desai', 'Joshi']
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[random(0, firstNames.length - 1)]
    const lastName = lastNames[random(0, lastNames.length - 1)]
    const username = `${firstName.toLowerCase()}${i + 1}`
    
    return {
      id: i + 1,
      username,
      first_name: firstName,
      last_name: lastName,
      email: `${username}@kotakbank.com`,
      mobile_number: `9${random(100000000, 999999999)}`,
      role: roles[random(0, roles.length - 1)],
      is_active: random(0, 10) > 1,
      created_at: new Date(Date.now() - random(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
      last_login: random(0, 5) > 2 ? new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000).toISOString() : null
    }
  })
}

export async function adminGetUsers(accessToken, page = 1, pageSize = 50) {
  await delay(500)
  
  const allUsers = generateDummyUsers(200)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const users = allUsers.slice(startIndex, endIndex)
  
  return {
    users,
    pagination: {
      current_page: page,
      page_size: pageSize,
      total_count: allUsers.length,
      total_pages: Math.ceil(allUsers.length / pageSize),
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
  
  return {
    total_users: random(150, 300),
    active_users: random(120, 250),
    inactive_users: random(10, 50),
    recent_logins_24h: random(50, 200)
  }
}

// Admin Activity Logs API replacement
export async function adminGetActivityLogs(accessToken) {
  await delay(500)
  
  const actions = ['Login', 'Logout', 'View Dashboard', 'Create User', 'Update User', 'Delete User', 'View Reports', 'Export Data']
  const users = ['admin', 'staff1', 'user1', 'manager1', 'staff2', 'user2']
  
  const logs = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    username: users[random(0, users.length - 1)],
    action: actions[random(0, actions.length - 1)],
    timestamp: new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000 - random(0, 86400000)).toISOString(),
    ip_address: `${random(192, 223)}.${random(0, 255)}.${random(0, 255)}.${random(0, 255)}`,
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: random(0, 10) > 1 ? 'Success' : 'Failed'
  }))
  
  return {
    logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    total_count: logs.length
  }
}

// Admin Today Uploaded Files API replacement
export async function adminGetTodayUploadedFiles(accessToken) {
  await delay(400)
  
  const files = Array.from({ length: random(5, 20) }, (_, i) => ({
    id: i + 1,
    filename: `upload_${new Date().toISOString().split('T')[0]}_${i + 1}.csv`,
    uploaded_by: `user${random(1, 10)}`,
    uploaded_at: new Date(Date.now() - random(0, 86400000)).toISOString(),
    file_size: random(100000, 5000000),
    status: ['Completed', 'Processing', 'Failed'][random(0, 2)],
    records_count: random(100, 10000)
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

// Admin Allocation Details API replacement
export async function adminGetAllocationDetails(accessToken) {
  await delay(500)
  
  const allocations = Array.from({ length: random(50, 200) }, (_, i) => ({
    id: i + 1,
    case_id: `CASE${String(i + 1).padStart(6, '0')}`,
    customer_name: `Customer ${i + 1}`,
    loan_type: ['Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment'][random(0, 3)],
    outstanding_amount: random(100000, 5000000),
    dpd: random(0, 180),
    allocated_by: `Manager ${random(1, 10)}`,
    allocated_to: `Staff ${random(1, 50)}`,
    allocated_date: new Date(Date.now() - random(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
    status: ['Active', 'Completed', 'Pending'][random(0, 2)],
    branch: `Branch ${random(1, 50)}`,
    state: ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu'][random(0, 3)]
  }))
  
  return { allocations }
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
  
  return {
    message: 'File uploaded successfully',
    filename: file.name,
    records_processed: random(100, 5000),
    records_successful: random(80, 4500),
    records_failed: random(0, 500),
    uploaded_at: new Date().toISOString()
  }
}

// Activity Summary API replacement (used in UserActivitySummary)
export async function getActivitySummary(accessToken, username, fromDate, toDate) {
  await delay(500)
  
  const users = username ? [username] : ['admin', 'staff1', 'user1', 'manager1', 'staff2']
  
  return {
    summary: users.map(u => ({
      username: u,
      total_sessions: random(10, 100),
      total_time_seconds: random(3600, 86400),
      avg_session_duration: random(300, 3600),
      last_activity: new Date(Date.now() - random(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
      pages_visited: random(50, 500),
      actions_performed: random(100, 1000)
    })),
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

