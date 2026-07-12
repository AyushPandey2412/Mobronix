'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router     = useRouter()
  const sb         = useMemo(() => createBrowserClient(), [])
  const [ready, setReady]   = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      // Authorization is enforced server-side in middleware.ts. This client gate
      // only trusts a REAL Supabase session with profiles.role = 'admin' — the
      // old localStorage/demo-admin bypass was removed.
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
          setAllowed(true)
          setReady(true)
          return
        }
      }

      // Not an admin — send to login
      router.replace('/login')
    }
    check()
  }, [sb, router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-text-tertiary text-body-sm">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/>
            <path d="M12 3a9 9 0 019 9" strokeLinecap="round"/>
          </svg>
          Verifying access…
        </div>
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
