// lib/otp.ts — phone OTP for the checkout login gate. Production-ready:
//   • Store    : shared KV (Upstash Redis in prod, in-memory in dev) — lib/kv.ts
//   • Hashing  : the code is stored HMAC-SHA256-hashed, never in plaintext
//   • Delivery : real SMS via lib/sms.ts (Twilio/MSG91/Fast2SMS), terminal in dev
//   • Safety   : 6-digit code, 5-min TTL, single-use, max-5 wrong attempts,
//                30s resend cooldown. No code is ever logged in production.
//
// To go live: set UPSTASH_REDIS_REST_URL/TOKEN and one SMS provider's env vars
// (see DEPLOY.md). With neither set, it runs in dev mode (in-memory + terminal).
import { createHmac, randomInt } from 'node:crypto'
import { kvGet, kvSet, kvDel, kvIncr } from './kv'
import { sendOtpSms, activeSmsProvider } from './sms'

const TTL_SECONDS  = 5 * 60   // code valid for 5 minutes
const MAX_ATTEMPTS = 5        // wrong-code guesses before the code is burned
const RESEND_SECS  = 30       // min gap between sends to the same number

// Pepper for hashing the (small, 6-digit) OTP space so a leaked store isn't
// trivially reversible. Falls back to a dev constant if unset.
const PEPPER = process.env.OTP_SECRET || 'dev-otp-pepper-change-me'

const codeKey    = (m: string) => `otp:code:${m}`
const attemptKey = (m: string) => `otp:attempts:${m}`
const resendKey  = (m: string) => `otp:resend:${m}`

function hashCode(code: string): string {
  return createHmac('sha256', PEPPER).update(code).digest('hex')
}

export type SendResult = { ok: true; devCode?: string } | { ok: false; error: string; retryAfter?: number }

export async function sendOtp(mobile: string): Promise<SendResult> {
  if (!/^\d{10}$/.test(mobile)) return { ok: false, error: 'Enter a valid 10-digit mobile number.' }

  // Resend cooldown (per number).
  if (await kvGet(resendKey(mobile))) {
    return { ok: false, error: 'Please wait a moment before requesting another code.', retryAfter: RESEND_SECS }
  }

  const code = String(randomInt(100000, 1000000))   // crypto-strong 6-digit
  await kvSet(codeKey(mobile), hashCode(code), TTL_SECONDS)
  await kvDel(attemptKey(mobile))                    // reset guesses for the new code
  await kvSet(resendKey(mobile), '1', RESEND_SECS)

  const text = `${code} is your SellMyiPhone verification code. Valid for 5 minutes. Do not share it with anyone.`
  const sms  = await sendOtpSms(mobile, code, text)
  if (!sms.ok) {
    console.error('[otp] SMS send failed via', sms.provider) // no code/PII logged
    return { ok: false, error: 'Could not send the code right now. Please try again.' }
  }

  // PREVIEW MODE — return the code to the client so it shows on-screen, for when
  // there's no real SMS provider yet (e.g. a first Vercel deploy). Enable by
  // setting OTP_DEV_MODE=true. Also on in local dev with the terminal fallback.
  // ⚠️ Turn OTP_DEV_MODE off once a real SMS provider is configured — while on,
  //    anyone can read the code, so it is NOT secure for real users.
  const preview =
    process.env.OTP_DEV_MODE === 'true' ||
    (process.env.NODE_ENV === 'development' && activeSmsProvider() === 'terminal')
  return preview ? { ok: true, devCode: code } : { ok: true }
}

export type VerifyResult = { ok: true } | { ok: false; error: string }

export async function verifyOtp(mobile: string, code: string): Promise<VerifyResult> {
  const stored = await kvGet(codeKey(mobile))
  if (!stored) return { ok: false, error: 'No code found or it has expired — please request a new one.' }

  const attempts = await kvIncr(attemptKey(mobile), TTL_SECONDS)
  if (attempts > MAX_ATTEMPTS) {
    // Burn the code AND clear the resend cooldown + counter so the user can
    // immediately request a fresh code (otherwise "request a new code" hits the
    // 30s resend block — a dead-end).
    await kvDel(codeKey(mobile))
    await kvDel(attemptKey(mobile))
    await kvDel(resendKey(mobile))
    return { ok: false, error: 'Too many incorrect attempts — please request a new code.' }
  }

  if (hashCode(String(code).trim()) !== stored) {
    return { ok: false, error: 'Incorrect code. Please try again.' }
  }

  // Success — single-use: clear everything.
  await kvDel(codeKey(mobile))
  await kvDel(attemptKey(mobile))
  await kvDel(resendKey(mobile))
  return { ok: true }
}
