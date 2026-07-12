import { notFound } from 'next/navigation'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import type { Enquiry, EnquiryHistory } from '@/lib/types'
import OrderDetail from './OrderDetail'

export const dynamic = 'force-dynamic'

export type OrderPhoto = { slot: string; url: string }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('enquiries')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single()
  if (!data) notFound()
  const enquiry = { ...(data as any), profile: (data as any).profiles } as Enquiry

  const { data: history } = await supabase
    .from('enquiry_history')
    .select('*')
    .eq('enquiry_id', id)
    .order('created_at', { ascending: false })

  // Device verification photos live in the PRIVATE `enquiry-photos` bucket, so we
  // mint short-lived signed URLs (service role, server-only) for the admin to view.
  // Previously these were uploaded but never displayed anywhere.
  let photos: OrderPhoto[] = []
  const { data: photoRows } = await supabase
    .from('enquiry_photos')
    .select('slot, storage_path')
    .eq('enquiry_id', id)
  if (photoRows?.length) {
    const svc = createServiceClient()
    const signed = await Promise.all(
      photoRows.map(async (p: any) => {
        const { data: s } = await svc.storage.from('enquiry-photos').createSignedUrl(p.storage_path, 60 * 60)
        return s?.signedUrl ? { slot: p.slot as string, url: s.signedUrl } : null
      })
    )
    photos = signed.filter(Boolean) as OrderPhoto[]
  }

  return <OrderDetail enquiry={enquiry} history={(history as EnquiryHistory[]) ?? []} photos={photos} />
}
