import { decryptData, encryptData } from './crypto'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function loginApi({ username, password }) {
  const url = `${API_BASE}/login/`
  console.log('Login API call to:', url)
  
  // Encrypt the credentials and send in payload field (matching backend expectation)
  const encryptedPayload = encryptData({ username, password })
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: encryptedPayload }),
  })
  
  const responseText = await res.text()
  console.log('Raw response status:', res.status)
  console.log('Raw response text length:', responseText.length)
  console.log('Raw response text (first 200 chars):', responseText.substring(0, 200))
  console.log('Response content-type:', res.headers.get('content-type'))
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(responseText)
      throw new Error(errorData.error || errorData.message || 'Login failed')
    } catch (e) {
      throw new Error(responseText || 'Login failed')
    }
  }
  
  // Backend returns encrypted string - try to parse as JSON first (might be wrapped in quotes)
  let encryptedString = null
  
  try {
    const jsonData = JSON.parse(responseText)
    // If it's a string value (encrypted data wrapped in JSON), extract it
    if (typeof jsonData === 'string') {
      console.log('Response is a JSON-wrapped string, extracting...')
      encryptedString = jsonData.trim()
    } else if (jsonData.encrypted || jsonData.payload) {
      // If backend wraps it in an object
      encryptedString = (jsonData.encrypted || jsonData.payload).trim()
    } else if (jsonData.message || jsonData.username) {
      // If it's already decrypted (shouldn't happen but handle it)
      console.log('Response is already decrypted:', jsonData)
      return jsonData
    }
  } catch (e) {
    // Not valid JSON, treat as plain encrypted string
    console.log('Response is not valid JSON, treating as encrypted base64 string...')
    encryptedString = responseText.trim()
  }
  
  // Clean up the encrypted string (remove any surrounding quotes if present)
  if (encryptedString) {
    encryptedString = encryptedString.replace(/^["']|["']$/g, '')
  } else {
    encryptedString = responseText.trim().replace(/^["']|["']$/g, '')
  }
  
  // Decrypt the response
  try {
    console.log('Attempting decryption with cleaned text (first 100 chars):', encryptedString.substring(0, 100))
    console.log('Encrypted string length:', encryptedString.length)
    
    const decryptedData = decryptData(encryptedString)
    console.log('Decrypted data:', decryptedData)
    return decryptedData
  } catch (error) {
    console.error('Failed to decrypt login response:', error)
    console.error('Encrypted text length:', encryptedString.length)
    console.error('Encrypted text preview:', encryptedString.substring(0, 100))
    throw new Error('Failed to process login response: ' + error.message)
  }
}

export async function logoutApi(accessToken) {
  const url = `${API_BASE}/logout/`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) {
    throw new Error('Logout failed')
  }
  return res.json().catch(() => ({}))
}

export async function dashboardApi(accessToken) {
  const url = `${API_BASE}/dashboard/`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch dashboard data')
  }
  return res.json()
}

export async function dashboardCollectionGraphApi(accessToken, fromDate, toDate) {
  const url = `${API_BASE}/dashboardcollectongraph/`
  
  // Convert date from YYYY-MM-DD to DD-MM-YYYY format (backend expects DD-MM-YYYY)
  const convertDateFormat = (dateStr) => {
    if (!dateStr) return dateStr
    const [year, month, day] = dateStr.split('-')
    return `${day}-${month}-${year}`
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_date: convertDateFormat(fromDate),
      to_date: convertDateFormat(toDate),
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch collection graph data')
  }
  return res.json()
}

export async function dashboardDepositionApi(accessToken, fromDate, toDate, page = 10, pageSize = 20) {
  const url = `${API_BASE}/dashboarddeposition/`
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_date: fromDate,
      to_date: toDate,
      page: page,
      page_size: pageSize,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch deposition data')
  }
  return res.json()
}

export async function dashboardDataApi(accessToken, reportType, fromDate, toDate) {
  const url = `${API_BASE}/dashboarddata/`
  
  // Default dates: 2025-01-01 to 2025-08-31
  const defaultFromDate = fromDate || '2025-01-01'
  const defaultToDate = toDate || '2025-08-31'
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report_type: reportType,
      from_date: defaultFromDate,
      to_date: defaultToDate,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch dashboard data')
  }
  return res.json()
}

export async function dashboardCollectionDataApi(accessToken, reportType, fromDate, toDate) {
  const url = `${API_BASE}/dashboardcollectiondata/`
  
  // Default dates: 2025-01-01 to 2025-08-31
  const defaultFromDate = fromDate || '2025-01-01'
  const defaultToDate = toDate || '2025-08-31'
  // Default report_type: collection state wise summary
  const defaultReportType = reportType || 'collection state wise summary'
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report_type: defaultReportType,
      from_date: defaultFromDate,
      to_date: defaultToDate,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch collection data')
  }
  return res.json()
}

// Admin API Functions
export async function adminGetUsers(accessToken, page = 1, pageSize = 50) {
  const url = `${API_BASE}/admin/users/?page=${page}&page_size=${pageSize}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch users')
  }
  return res.json()
}

export async function adminCreateUser(accessToken, userData) {
  const url = `${API_BASE}/admin/users/create/`
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  
  const responseText = await res.text()
  if (!res.ok) {
    try {
      const errorData = JSON.parse(responseText)
      throw new Error(errorData.error || 'Failed to create user')
    } catch (e) {
      throw new Error(responseText || 'Failed to create user')
    }
  }
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    return { message: 'User created successfully' }
  }
}

export async function adminUpdateUser(accessToken, username, userData) {
  const url = `${API_BASE}/admin/users/${username}/`
  
  // Only include password if it's provided (not empty)
  const payload = { ...userData }
  if (!payload.password || payload.password.trim() === '') {
    delete payload.password
  }
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  
  const responseText = await res.text()
  if (!res.ok) {
    try {
      const errorData = JSON.parse(responseText)
      throw new Error(errorData.error || 'Failed to update user')
    } catch (e) {
      throw new Error(responseText || 'Failed to update user')
    }
  }
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    return { message: 'User updated successfully' }
  }
}

export async function adminDeleteUser(accessToken, username) {
  // Soft delete: Set is_active to 0 instead of actually deleting
  const url = `${API_BASE}/admin/users/${username}/`
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: 0 }),
  })
  
  const responseText = await res.text()
  if (!res.ok) {
    try {
      const errorData = JSON.parse(responseText)
      throw new Error(errorData.error || 'Failed to delete user')
    } catch (e) {
      throw new Error(responseText || 'Failed to delete user')
    }
  }
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    return { message: 'User deleted successfully' }
  }
}

export async function adminGetActivityLogs(accessToken) {
  const url = `${API_BASE}/admin/activity-logs/`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.error || errorData.details || 'Failed to fetch activity logs')
    } catch (e) {
      throw new Error(text || 'Failed to fetch activity logs')
    }
  }
  return res.json()
}

export async function adminGetDashboardStats(accessToken) {
  const url = `${API_BASE}/admin/dashboard/stats/`
  console.log('Making API call to:', url)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  console.log('API response status:', res.status, res.statusText)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('API call failed:', res.status, text)
    throw new Error(text || 'Failed to fetch dashboard stats')
  }
  const data = await res.json()
  console.log('API call successful, data:', data)
  return data
}


