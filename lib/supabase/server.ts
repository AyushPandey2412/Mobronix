// Server-side Supabase clients (Next.js 15 — cookies() is async).
// - createServerClient(): respects the user's cookie session (RLS applies as that user).
//   Works in both Server Components and Route Handlers. Must be awaited.
// - createServiceClient(): uses the service-role key, bypasses RLS. SERVER ONLY.
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerClient = async () => {
  const cookieStore = await cookies()
  return createSSRClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // Setting cookies throws when called from a Server Component (read-only).
        // In Route Handlers / Server Actions it succeeds and refreshes the session.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /* called from a Server Component — safe to ignore */
        }
      },
    },
  })
}

// Route handlers and server components share the same cookie-aware client.
export const createRouteClient = createServerClient

export const createServiceClient = () =>
  createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

// Cookie-LESS anon client for PUBLIC reads (models, questions, reviews).
// Crucially it does NOT call cookies(), so pages using it can be statically
// rendered / ISR-cached instead of being forced into per-request dynamic
// rendering. Use this for public data on cacheable pages (e.g. the home page).
export const createPublicClient = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
