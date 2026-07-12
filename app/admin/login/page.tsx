'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/Logo'

export default function AdminLoginPage() {
  const sb     = useMemo(() => createBrowserClient(), [])
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  async function login() {
    setError(''); setBusy(true)
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setBusy(false); setError(error.message); return }
    const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user!.id).single()
    setBusy(false)
    if (profile?.role !== 'admin') { setError('This account does not have admin access.'); await sb.auth.signOut(); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-primary-950">
        <Logo className="[&_span:last-child]:text-white [&_.text-brand]:text-primary-300" />
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Manage every<br />
            <span className="text-primary-300">sell order</span><br />
            from one place.
          </h1>
          <p className="mt-4 text-primary-200/60 text-body-md leading-relaxed max-w-sm">
            View enquiries, update tracking, manage your product catalog and configure condition questions.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { v: 'Real-time',    l: 'Live enquiries' },
              { v: 'One-click',    l: 'WhatsApp notify' },
              { v: 'Instant',      l: 'CSV export' },
              { v: 'Full control', l: 'Product CRUD' },
            ].map(s => (
              <div key={s.l} className="rounded-lg bg-white/5 border border-white/10 p-3.5">
                <p className="text-primary-300 text-label font-bold">{s.v}</p>
                <p className="text-primary-200/40 text-caption mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-200/20 text-caption">Authorized personnel only · SellMyiPhone © 2025</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>

          <h2 className="text-h2 font-extrabold text-text-primary tracking-tight">Admin sign in</h2>
          <p className="mt-2 text-body-md text-text-secondary">Enter your credentials to access the dashboard.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-label font-semibold text-text-primary mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@sellmyiphone.in"
                className="w-full bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-4 py-2.5 text-body-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.15)] transition-all"
              />
            </div>
            <div>
              <label className="block text-label font-semibold text-text-primary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-4 py-2.5 text-body-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.15)] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-error-50 border border-error-200 rounded-md px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error-600 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-error-700 text-body-sm">{error}</p>
              </div>
            )}

            <button
              onClick={login}
              disabled={busy || !email || !password}
              className="w-full h-11 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-md text-body-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {busy ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/>
                    <path d="M12 3a9 9 0 019 9" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </div>

          <p className="mt-6 text-center text-caption text-text-tertiary">
            Only accounts with admin role can access this panel.
          </p>
        </div>
      </div>
    </div>
  )
}
