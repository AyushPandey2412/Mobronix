// POST /api/otp/send  { mobile }  → generates a code and sends it via SMS.
// In dev (no provider configured) the code is printed to the terminal and
// returned as devCode. Rate-limited per IP + per number.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendOtp } from '@/lib/otp'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const schema = z.object({ mobile: z.string().regex(/^\d{10}$/) })

export async function POST(req: Request) {
  const ip = clientIp(req)
  const rl = await rateLimit(`otp-send:${ip}`, 5, 10 * 60)   // 5 sends / 10 min / IP
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  let body
  try { body = schema.parse(await req.json()) }
  catch { return NextResponse.json({ error: 'Enter a valid 10-digit mobile number.' }, { status: 400 }) }

  const res = await sendOtp(body.mobile)
  if (!res.ok) {
    return NextResponse.json({ error: res.error },
      { status: 429, headers: res.retryAfter ? { 'Retry-After': String(res.retryAfter) } : undefined })
  }
  return NextResponse.json({ ok: true, devCode: res.devCode ?? null })
}
