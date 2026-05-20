import { clearToken, getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api'

export type ApiValidationError = {
  message: string
  fields?: Record<string, string>
}

export class ApiError extends Error {
  fields?: Record<string, string>
  status: number

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  authenticated?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  if (options.authenticated) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (options.authenticated && response.status === 401) {
      clearToken()
      window.location.assign('/login')
    }

    const apiError = data?.error as ApiValidationError | undefined
    throw new ApiError(
      apiError?.message ?? data?.message ?? `API request failed: ${response.status}`,
      response.status,
      apiError?.fields,
    )
  }

  return data as T
}

export async function apiMultipartRequest<T>(
  path: string,
  formData: FormData,
  options: Omit<RequestOptions, 'body'> = {},
): Promise<T> {
  const headers = new Headers()

  if (options.authenticated) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'POST',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (options.authenticated && response.status === 401) {
      clearToken()
      window.location.assign('/login')
    }

    const apiError = data?.error as ApiValidationError | undefined
    throw new ApiError(
      apiError?.message ?? data?.message ?? `API request failed: ${response.status}`,
      response.status,
      apiError?.fields,
    )
  }

  return data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path)
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
