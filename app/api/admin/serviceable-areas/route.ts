import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient, createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  pincode: z.string().regex(/^[1-9]\d{5}$/),
  area_name: z.string().trim().max(120).default(''),
  is_active: z.boolean().default(true),
})

async function handle(req: Request) {
  try {
    const client = await createRouteClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })
    const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const db = createServiceClient()
    if (req.method === 'GET') {
      const { data, error } = await db.from('serviceable_areas').select('*').order('pincode')
      if (error) throw error
      return NextResponse.json({ areas: data }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const body = await req.json().catch(() => null)
    const parsed = (req.method === 'DELETE' ? schema.pick({ pincode: true }) : req.method === 'PATCH' ? schema.extend({ original_pincode: z.string().regex(/^[1-9]\d{5}$/) }) : schema).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid 6-digit pincode and area name (up to 120 characters).' }, { status: 400 })
    if (req.method === 'PATCH') {
      const { original_pincode, ...area } = parsed.data as z.infer<typeof schema> & { original_pincode: string }
      const { data, error } = await db.from('serviceable_areas').update(area).eq('pincode', original_pincode).select('pincode').maybeSingle()
      if (error?.code === '23505') return NextResponse.json({ error: 'That pincode already exists. Choose a different pincode.' }, { status: 409 })
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'This area no longer exists. Refresh the page.' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }
    const result = req.method === 'DELETE'
      ? await db.from('serviceable_areas').delete().eq('pincode', parsed.data.pincode)
      : await db.from('serviceable_areas').insert(parsed.data)
    if (result.error?.code === '23505') return NextResponse.json({ error: 'This pincode already exists.' }, { status: 409 })
    if (result.error) throw result.error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not save or load serviceable areas. Please check that migration 011 has been applied and try again.' }, { status: 503 })
  }
}
export const GET = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
