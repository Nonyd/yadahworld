'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import AdminBrandedLogo from '@/components/admin/AdminBrandedLogo'
import { useRouter } from 'next/navigation'

export default function AdminLoginClient({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="admin-app relative min-h-screen flex items-center justify-center px-4 py-16">
      <div className="admin-card w-full max-w-md p-8 sm:p-10">
        <div className="flex justify-center">
          <AdminBrandedLogo logoUrl={logoUrl} siteName={siteName} width={280} height={72} className="h-14 w-auto" priority />
        </div>
        <p className="mt-6 text-center text-[0.65rem] font-medium uppercase tracking-[0.22em] text-admin-muted">
          Studio sign in
        </p>

        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-6">
          <div>
            <label className="admin-label">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-admin-muted transition hover:text-admin-text"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
                    <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9 7 9 7a16.67 16.67 0 01-3.21 3.88" />
                    <path d="M6.61 6.61A16.14 16.14 0 003 12s4 7 9 7a8.8 8.8 0 003.89-.89" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="admin-btn admin-btn-primary w-full sm:w-auto">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
