import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { enquiryAmount, enquiryDeviceAmount } from '@/lib/enquiryPricing'

const updatePriceSchema = z.object({
  id: z.string().uuid(),
  deviceIndex: z.number().int().min(0).default(0),
  finalAmount: z.number().int().min(1).max(10_000_000),
})

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

  let parsed: z.infer<typeof updatePriceSchema>
  try {
    parsed = updatePriceSchema.parse(await req.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid price update', detail: error?.message }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  const { data: current, error: fetchError } = await serviceClient
    .from('enquiries')
    .select('id, display_id, devices, total_amount')
    .eq('id', parsed.id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: fetchError?.message || 'Enquiry not found' }, { status: 404 })
  }

  const devices = Array.isArray(current.devices) ? [...current.devices] : []
  const target = devices[parsed.deviceIndex]
  if (!target) {
    return NextResponse.json({ error: 'Device not found for this enquiry' }, { status: 404 })
  }

  const previousAmount = enquiryDeviceAmount(target)
  devices[parsed.deviceIndex] = { ...target, final: parsed.finalAmount, admin_final_price: true }
  const totalAmount = enquiryAmount({ devices, total_amount: current.total_amount })

  const { data: updated, error: updateError } = await serviceClient
    .from('enquiries')
    .update({ devices, total_amount: totalAmount })
    .eq('id', parsed.id)
    .select('*, profiles(full_name, phone)')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || 'Could not update price' }, { status: 500 })
  }

  await serviceClient.from('enquiry_history').insert({
    enquiry_id: parsed.id,
    actor: 'admin',
    action: `Final price changed from ₹${previousAmount.toLocaleString('en-IN')} to ₹${parsed.finalAmount.toLocaleString('en-IN')} by ${user.email ?? user.id}`,
  })

  return NextResponse.json({
    enquiry: { ...(updated as any), profile: (updated as any).profiles },
  })
}
