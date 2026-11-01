import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { customerReviewSchema, publicReviewName, reviewEligibility } from '@/lib/reviews'
import { rateLimit, clientIp } from '@/lib/ratelimit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('enquiry_id')
    const db = createServiceClient()
    if (!id) {
      const { data, error } = await db.from('customer_reviews').select('id, name, device, rating, review_text').eq('status', 'published').order('created_at', { ascending: false }).limit(12)
      if (error) throw error
      return json({ reviews: data })
    }
    if (!z.string().uuid().safeParse(id).success) return json({ eligible: false })
    const client = await createRouteClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return json({ error: 'Please log in to leave a review.' }, 401)
    const { data: order, error } = await db.from('enquiries').select('user_id, status').eq('id', id).maybeSingle()
    if (error) throw error
    if (!order || order.user_id !== user.id) return json({ eligible: false })
    const { data: review, error: reviewError } = await db.from('customer_reviews').select('rating, review_text').eq('enquiry_id', id).maybeSingle()
    if (reviewError) throw reviewError
    return json({ eligible: reviewEligibility(order, user.id), review })
  } catch {
    return json({ error: 'Reviews are temporarily unavailable. Please try again.' }, 503)
  }
}

export async function POST(req: Request) {
  try {
    const client = await createRouteClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return json({ error: 'Please log in to leave a review.' }, 401)
    const limit = await rateLimit(`review:${user.id}:${clientIp(req)}`, 10, 60)
    if (!limit.ok) return json({ error: 'Please wait a minute before trying again.' }, 429)
    const parsed = customerReviewSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return json({ error: 'Choose 1–5 stars and write a review between 10 and 1,000 characters.' }, 400)
    const db = createServiceClient()
    const { data: order, error } = await db.from('enquiries').select('id, user_id, status, devices, guest_name').eq('id', parsed.data.enquiry_id).maybeSingle()
    if (error) throw error
    if (!order || !reviewEligibility(order, user.id)) return json({ error: 'You can only review your own completed order.' }, 403)
    const { data: profile } = await db.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    const devices = Array.isArray(order.devices) ? order.devices : []
    const device = String(devices[0]?.model || 'Device').slice(0, 120)
    const { error: insertError } = await db.from('customer_reviews').insert({ ...parsed.data, user_id: user.id, name: publicReviewName(profile?.full_name || order.guest_name), device, status: 'pending' })
    if (insertError?.code === '23505') return json({ error: 'You have already reviewed this order.' }, 409)
    if (insertError) throw insertError
    return json({ ok: true }, 201)
  } catch {
    return json({ error: 'Could not submit your review. Please try again.' }, 503)
  }
}
