import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'

const updatePaymentSchema = z.object({
  id: z.string().uuid(),
  paymentMode: z.enum(['UPI', 'Cash']),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
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
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let parsed: z.infer<typeof updatePaymentSchema>
  try {
    parsed = updatePaymentSchema.parse(await req.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid payment update', detail: error?.message }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  const { data: current, error: fetchError } = await serviceClient
    .from('enquiries')
    .select('id, payment_mode, payment_date')
    .eq('id', parsed.id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: fetchError?.message || 'Enquiry not found' }, { status: 404 })
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('enquiries')
    .update({ payment_mode: parsed.paymentMode, payment_date: parsed.paymentDate ?? null })
    .eq('id', parsed.id)
    .select('*, profiles(full_name, phone)')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || 'Could not update payment details' }, { status: 500 })
  }

  const previousDate = (current as any).payment_date || 'not set'
  const nextDate = parsed.paymentDate || 'not set'
  await serviceClient.from('enquiry_history').insert({
    enquiry_id: parsed.id,
    actor: 'admin',
    action: `Payment changed from ${(current as any).payment_mode || 'not set'} (${previousDate}) to ${parsed.paymentMode} (${nextDate}) by ${user.email ?? user.id}`,
  })

  return NextResponse.json({
    enquiry: { ...(updated as any), profile: (updated as any).profiles },
  })
}
