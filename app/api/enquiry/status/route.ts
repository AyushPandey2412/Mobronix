// GET /api/enquiry/status?id=<uuid>  or  ?ref=<ENQ-00001>
// Returns the live status of an enquiry. Uses the service-role key so it works
// for guest orders (user_id = null) that the anon browser client can't read
// under RLS. Only non-sensitive status fields are returned (no address/phone).
import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { createEnquiryService, updateStatusSchema } from '@/lib/enquiries/service'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id  = url.searchParams.get('id')?.trim()
  const ref = url.searchParams.get('ref')?.trim()

  if (!id && !ref) {
    return NextResponse.json({ error: 'Provide an id or ref' }, { status: 400 })
  }

  const svc = createServiceClient()
  let query = svc
    .from('enquiries')
    .select('id, display_id, devices, total_amount, status, tracking_step, assigned_exec')

  // Exact match only. display_id is sequential and guessable, so the `ref` path
  // is treated as UNTRUSTED; the unguessable UUID `id` path proves ownership.
  // (Previously `ilike` allowed LIKE-wildcard probing — removed.)
  query = id ? query.eq('id', id) : query.eq('display_id', ref!)

  const { data, error } = await query.maybeSingle()
  if (error)  return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data)  return NextResponse.json({ error: 'No order found' }, { status: 404 })

  const devices = Array.isArray(data.devices) ? data.devices : []
  const first   = (devices[0] ?? {}) as { model?: string; storage?: string }
  const model   = devices.length > 1 ? `${first.model ?? 'Device'} +${devices.length - 1} more` : (first.model ?? 'Device')

  // Sensitive fields (payout amount, assigned executive) are only returned when
  // the caller supplied the UUID `id` — which only the order owner has. Lookups
  // by the sequential ENQ number get status/stage only, so the endpoint can't be
  // enumerated to scrape every customer's payout amount.
  const ownerVerified = Boolean(id)

  return NextResponse.json({
    id:         data.id,
    display_id: data.display_id,
    model,
    storage:    first.storage ?? '',
    amount:     ownerVerified ? (data.total_amount ?? 0) : null,
    step:       data.tracking_step ?? 0,
    status:     data.status ?? 'new',
    exec:       ownerVerified ? (data.assigned_exec ?? '') : '',
  })
}

export async function PATCH(req: Request) {
  const routeClient = await createRouteClient()
  const { data: { user } } = await routeClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await routeClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let parsed
  try {
    parsed = updateStatusSchema.parse(await req.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request body', detail: error?.message }, { status: 400 })
  }

  try {
    const result = await createEnquiryService().updateStatus(parsed, user.email ?? user.id)
    return NextResponse.json({
      enquiry: result.enquiry,
      changed: result.changed,
      notification: result.notification ?? null,
    })
  } catch (error: any) {
    console.error('[api/enquiry/status] update failed', error)
    return NextResponse.json({ error: error?.message || 'Could not update status' }, { status: 500 })
  }
}
