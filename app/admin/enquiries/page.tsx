import { redirect } from 'next/navigation'

// The old enquiries list read from the local Zustand seed (demo data), which was
// disconnected from the real database. Orders now live at /admin/orders (real
// Supabase data). Redirect any old links/bookmarks there.
export default function AdminEnquiriesRedirect() {
  redirect('/admin/orders')
}
