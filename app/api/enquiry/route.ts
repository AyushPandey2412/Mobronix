import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { rateLimit, clientIp } from '@/lib/ratelimit'
import { createEnquirySchema, createEnquiryService } from '@/lib/enquiries/service'

export const runtime = 'nodejs'

const updatePickupSchema = z.object({
  id: z.string().uuid(),
  address: z.string().trim().min(3).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  pickup_slot: z.string().trim().min(1).optional(),
  payment_mode: z.enum(['UPI', 'Cash']).optional(),
})

export async function POST(req: Request) {
  const ip = clientIp(req)
  const rl = await rateLimit(`enquiry:${ip}`, 5, 60)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  let parsed
  try {
    parsed = createEnquirySchema.parse(await req.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request body', detail: error?.message }, { status: 400 })
  }

  let userId: string | null = null
  let userEmail: string | null = null
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
    userEmail = user?.email ?? null
  } catch {
    userId = null
    userEmail = null
  }

  try {
    const { enquiry, assignedExec } = await createEnquiryService().create(parsed, { userId, userEmail })
    return NextResponse.json({
      enquiryId: enquiry.id,
      displayId: enquiry.display_id,
      assignedExec,
    })
  } catch (error: any) {
    console.error('[api/enquiry] create failed', error)
    const message = error?.message || 'Could not create enquiry'
    const status = /price|invalid|mismatch/i.test(message) ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: Request) {
  let parsed
  try {
    parsed = updatePickupSchema.parse(await req.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid pickup details', detail: error?.message }, { status: 400 })
  }

  const routeClient = await createRouteClient()
  const { data: { user } } = await routeClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in to update pickup details.' }, { status: 401 })

  const serviceClient = createServiceClient()
  const { data: current, error: fetchError } = await serviceClient
    .from('enquiries')
    .select('id, user_id, address, pincode, pickup_slot, payment_mode')
    .eq('id', parsed.id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
  }

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const allowed = current.user_id === user.id || profile?.role === 'admin'
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const update = {
    address: parsed.address || current.address || 'To be collected by phone',
    pincode: parsed.pincode || current.pincode || '000000',
    pickup_slot: parsed.pickup_slot || current.pickup_slot || 'To be collected by phone',
    payment_mode: parsed.payment_mode || current.payment_mode || 'Cash',
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('enquiries')
    .update(update)
    .eq('id', parsed.id)
    .select('id, address, pincode, pickup_slot, payment_mode')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || 'Could not update pickup details' }, { status: 500 })
  }

  await serviceClient
    .from('enquiry_history')
    .insert({ enquiry_id: parsed.id, actor: 'customer', action: 'Customer updated pickup details' })

  return NextResponse.json({ ok: true, enquiry: updated })
}
