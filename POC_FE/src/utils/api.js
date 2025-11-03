const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function loginApi({ username, password }) {
  const url = `${API_BASE}/login/`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Login failed')
  }
  return res.json()
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


