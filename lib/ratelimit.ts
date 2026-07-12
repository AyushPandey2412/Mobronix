// lib/ratelimit.ts — fixed-window rate limiter backed by the shared KV store
// (Upstash in prod, in-memory in dev). Works across serverless instances when
// Upstash is configured. Use for /login, /register, OTP, and enquiry endpoints.
import { kvIncr } from './kv'

export type RateResult = { ok: boolean; remaining: number; retryAfter: number }

/**
 * @param key    unique bucket, e.g. `otp-send:<ip>` or `enquiry:<ip>`
 * @param max    allowed hits per window
 * @param windowSeconds window length
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<RateResult> {
  try {
    const count = await kvIncr(`rl:${key}`, windowSeconds)
    const ok = count <= max
    return { ok, remaining: Math.max(0, max - count), retryAfter: ok ? 0 : windowSeconds }
  } catch {
    // Fail OPEN on KV errors — never block a real user because the limiter is down.
    return { ok: true, remaining: max, retryAfter: 0 }
  }
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
