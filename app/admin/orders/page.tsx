'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { QK, fetchEnquiries } from '@/lib/adminQueries'
import Dashboard from '../Dashboard'
import { ScreenSkeleton } from '@/components/ui/Skeleton'

// The "Orders" tab. Previously this route did not exist (only /admin/orders/[id]),
// so the nav link 404'd. It now renders the same real, Supabase-backed list the
// dashboard uses — rows link to /admin/orders/[id]. No local-seed fallback.
export default function AdminOrdersPage() {
  const sb = useMemo(() => createBrowserClient(), [])

  const { data: enquiries, isLoading, isError } = useQuery({
    queryKey: QK.enquiries(),
    queryFn:  () => fetchEnquiries(sb),
  })

  if (isLoading) return <ScreenSkeleton />

  if (isError) return (
    <div className="rounded-lg border border-error-200 bg-error-50 px-5 py-4 text-body-sm text-error-700">
      Could not load orders. Check your Supabase connection.
    </div>
  )

  return (
    <Dashboard
      enquiries={enquiries ?? []}
      title="Orders"
      subtitle="Every customer enquiry, live from the database"
    />
  )
}
