// Browser-side Supabase client (uses the public anon key).
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

export const createBrowserClient = () =>
  createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
