// POST /api/otp/verify  { mobile, code }  → checks the code. Rate-limited per IP
// (defence-in-depth on top of the per-number max-5-attempts in lib/otp).
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyOtp } from '@/lib/otp'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const schema = z.object({
  mobile: z.string().regex(/^\d{10}$/),
  code:   z.string().regex(/^\d{4,6}$/),
})

export async function POST(req: Request) {
  const ip = clientIp(req)
  const rl = await rateLimit(`otp-verify:${ip}`, 15, 10 * 60)   // 15 tries / 10 min / IP
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  let body
  try { body = schema.parse(await req.json()) }
  catch { return NextResponse.json({ error: 'Enter the code we sent you.' }, { status: 400 }) }

  const res = await verifyOtp(body.mobile, body.code)
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
