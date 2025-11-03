import { decryptData } from './crypto'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function loginApi({ username, password }) {
  const url = `${API_BASE}/login/`
  console.log('Login API call to:', url)
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  
  const responseText = await res.text()
  console.log('Raw response status:', res.status)
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
  
  // Try to parse as JSON first (in case backend returns unencrypted or wrapped response)
  try {
    const jsonData = JSON.parse(responseText)
    // If it's a string value (encrypted data wrapped in JSON), extract it
    if (typeof jsonData === 'string') {
      console.log('Response is a JSON-wrapped string, extracting and decrypting...')
      const decryptedData = decryptData(jsonData.trim())
      console.log('Decrypted data:', decryptedData)
      return decryptedData
    }
    // If it's already an object with expected fields, return it
    if (jsonData.message || jsonData.username) {
      console.log('Parsed as JSON object:', jsonData)
      return jsonData
    }
  } catch (e) {
    console.log('Response is not valid JSON, treating as encrypted base64 string...')
  }
  
  // Treat as encrypted base64 string directly
  try {
    // Clean up the response text (remove any whitespace, quotes, etc.)
    const cleanedText = responseText.trim().replace(/^["']|["']$/g, '')
    console.log('Attempting decryption with cleaned text (first 100 chars):', cleanedText.substring(0, 100))
    
    const decryptedData = decryptData(cleanedText)
    console.log('Decrypted data:', decryptedData)
    return decryptedData
  } catch (error) {
    console.error('Failed to decrypt login response:', error)
    console.error('Encrypted text length:', responseText.length)
    console.error('Encrypted text preview:', responseText.substring(0, 100))
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


