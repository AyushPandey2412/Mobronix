import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { enquiryAmount, hasAdminFinalPrice } from '@/lib/enquiryPricing'
import { ENQUIRY_STATUS_STEPS, normalizeLegacyStatus } from '@/lib/enquiryStatus'

export async function GET() {
  const routeClient = await createRouteClient()
  const { data: { user } } = await routeClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .maybeSingle()

  const phone = profile?.phone || user.phone || user.user_metadata?.phone || ''
  const filters = [`user_id.eq.${user.id}`]
  if (phone) filters.push(`guest_phone.eq.${phone}`)

  const { data, error } = await serviceClient
    .from('enquiries')
    .select('id, display_id, devices, total_amount, status, tracking_step, guest_phone')
    .or(filters.join(','))
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ enquiries: [], enquiry: null })

  const enquiries = data.map((row: any) => {
    const devices = Array.isArray(row.devices) ? row.devices : []
    const first = (devices[0] ?? {}) as { model?: string; storage?: string }
    const model = devices.length > 1 ? `${first.model ?? 'Device'} +${devices.length - 1} more` : (first.model ?? 'Device')
    const status = normalizeLegacyStatus(row.status)
    return {
      id: row.id,
      display_id: row.display_id,
      model,
      storage: first.storage ?? '',
      amount: enquiryAmount(row as any),
      priceFinalized: hasAdminFinalPrice(row as any),
      step: ENQUIRY_STATUS_STEPS[status] ?? 0,
      status,
      mobile: phone || row.guest_phone || '',
    }
  })

  return NextResponse.json({
    enquiries,
    enquiry: enquiries[0] ?? null,
  })
}
