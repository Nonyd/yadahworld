'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password.')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md border p-10" style={{ borderColor: 'rgba(201,168,76,0.25)', background: 'var(--surface)' }}>
        <p className="font-playfair text-2xl italic mb-1" style={{ color: 'var(--body)' }}>
          Yadah
        </p>
        <p className="ui-label mb-10" style={{ color: 'var(--muted)' }}>
          Admin sign in
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              required
            />
          </div>
          <div>
            <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              required
            />
          </div>
          {error && (
            <p className="font-jost text-xs" style={{ color: 'var(--accent)' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary self-start">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
