export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function api(path, { method = 'GET', body, token } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the Flask API running?')
  }

  let data = null
  try { data = await res.json() } catch { /* 204 has no body */ }

  if (!res.ok) {
    if (res.status === 401 && token) throw new Error('Your session expired. Please log in again.')
    throw new Error(data?.error || data?.msg || `Request failed (${res.status})`)
  }
  return data
}
