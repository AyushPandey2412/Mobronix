'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const LINKS = [
  {
    href: '/admin', label: 'Dashboard', exact: true,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  },
  {
    href: '/admin/orders', label: 'Orders', exact: false,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
  },
  {
    href: '/admin/products', label: 'Products', exact: false,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
  },
  {
    href: '/admin/questions', label: 'Questions', exact: false,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
  },
]

export default function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const path   = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function logout() {
    const sb = createBrowserClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  if (horizontal) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close admin menu' : 'Open admin menu'}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-primary shadow-xs transition-colors hover:border-primary-200 hover:text-brand"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-lg">
            <nav className="flex flex-col gap-1">
              {LINKS.map(l => {
                const active = l.exact ? path === l.href : path.startsWith(l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors',
                      active ? 'bg-brand text-white' : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                    )}
                  >
                    <span className={active ? 'text-white' : 'text-text-tertiary'}>{l.icon}</span>
                    {l.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-2 border-t border-border pt-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to site
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-body-sm font-medium text-text-tertiary transition-colors hover:bg-error-50 hover:text-error-600"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {LINKS.map(l => {
        const active = l.exact ? path === l.href : path.startsWith(l.href)
        return (
          <Link key={l.href} href={l.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-body-sm font-medium transition-colors',
              active
                ? 'bg-primary-50 text-brand'
                : 'text-text-secondary hover:text-text-primary hover:bg-neutral-100'
            )}>
            <span className={active ? 'text-brand' : 'text-text-tertiary'}>{l.icon}</span>
            {l.label}
          </Link>
        )
      })}

      <div className="mt-3 pt-3 border-t border-border">
        <button onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-body-sm font-medium text-text-tertiary hover:text-error-600 hover:bg-error-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}
