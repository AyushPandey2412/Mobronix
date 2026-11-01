import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
async function handle(req: Request) {
  try {
    const client = await createRouteClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })
    const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const db = createServiceClient()
    if (req.method === 'GET') {
      const { data, error } = await db.from('customer_reviews').select('id, enquiry_id, name, device, rating, review_text, status, created_at, enquiries(display_id)').neq('status', 'deleted').order('created_at', { ascending: false }).limit(500)
      if (error) throw error
      return NextResponse.json({ reviews: data }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const parsed = z.object({ id: z.string().uuid(), status: z.enum(['published', 'hidden', 'deleted']) }).safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Invalid review update.' }, { status: 400 })
    const query = parsed.data.status === 'deleted'
      ? db.from('customer_reviews').delete().eq('id', parsed.data.id)
      : db.from('customer_reviews').update({ status: parsed.data.status }).eq('id', parsed.data.id).neq('status', 'deleted')
    const { data, error } = await query.select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not load or update reviews. Check that migration 012 has been applied and try again.' }, { status: 503 })
  }
}
export const GET = handle
export const PATCH = handle
