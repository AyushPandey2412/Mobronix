import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { rateLimit, clientIp } from '@/lib/ratelimit'
import { createEnquirySchema, createEnquiryService } from '@/lib/enquiries/service'

export const runtime = 'nodejs'

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
