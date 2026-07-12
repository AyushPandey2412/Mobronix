import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  // Refresh the Supabase session cookie so server components can read it.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() revalidates the token and triggers cookie refresh via setAll above.
  const { data: { user } } = await supabase.auth.getUser()

  // ── Server-side admin enforcement ────────────────────────────────────────
  // The client AdminAuthGate is only UX; real authorization happens here so the
  // admin pages are never served to a non-admin (no JS-disable / localStorage
  // bypass). The login page itself stays public so admins can sign in.
  const path = req.nextUrl.pathname
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = { matcher: ['/admin/:path*'] }
