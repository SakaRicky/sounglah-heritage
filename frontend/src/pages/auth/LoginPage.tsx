import { FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { login } from '../../lib/api'
import { isAuthenticated, saveToken } from '../../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token } = await login(email, password)
      saveToken(token)
      navigate('/admin')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section mx-auto max-w-md py-16">
      <div className="card p-8 shadow-card">
        <h1 className="text-3xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-cocoa-700">
          Access the Sounglah content management area.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-soft bg-cream-100 px-4 py-3 text-sm text-terracotta-600" role="alert">
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-cocoa-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              className="focus-ring mt-2 w-full rounded-button border border-sand-100 px-4 py-3 text-cocoa-800 disabled:opacity-60"
              placeholder="admin@sounglah.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-cocoa-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="focus-ring mt-2 w-full rounded-button border border-sand-100 px-4 py-3 text-cocoa-800 disabled:opacity-60"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  )
}
