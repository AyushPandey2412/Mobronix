// Browser-side Supabase client (uses the public anon key).
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { authCookieOptions } from '@/lib/authSession'

export const createBrowserClient = () =>
  createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions,
      auth: {
        userStorage: typeof window === 'undefined' ? undefined : window.sessionStorage,
      },
    }
  )
