import { redirect } from 'next/navigation'

// Old Zustand-backed detail view. Real order detail lives at /admin/orders/[id]
// (Supabase). Redirect old links there.
export default async function AdminEnquiryDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/orders/${id}`)
}
