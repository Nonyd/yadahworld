'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import AdminBrandedLogo from '@/components/admin/AdminBrandedLogo'
import { useRouter } from 'next/navigation'

export default function AdminLoginClient({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
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
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              required
            />
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
