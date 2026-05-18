const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

type LoginResponse = {
  token: string
}

type ErrorResponse = {
  message?: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = (await response.json()) as LoginResponse & ErrorResponse

  if (!response.ok) {
    throw new Error(data.message ?? 'Unable to sign in. Please try again.')
  }

  return { token: data.token }
}
