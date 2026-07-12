'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { QK, fetchEnquiries } from '@/lib/adminQueries'
import Dashboard from './Dashboard'
import { ScreenSkeleton } from '@/components/ui/Skeleton'

export default function AdminDashboardPage() {
  const sb = useMemo(() => createBrowserClient(), [])

  // Real Supabase enquiries only — no local-seed fallback (that showed fake
  // demo data with mismatched fields when the DB query came back empty).
  const { data: enquiries, isLoading, isError } = useQuery({
    queryKey: QK.enquiries(),
    queryFn:  () => fetchEnquiries(sb),
  })

  if (isLoading) return <ScreenSkeleton />

  if (isError) return (
    <div className="rounded-lg border border-error-200 bg-error-50 px-5 py-4 text-body-sm text-error-700">
      Could not load enquiries. Check your Supabase connection.
    </div>
  )

  return <Dashboard enquiries={enquiries ?? []} />
}
