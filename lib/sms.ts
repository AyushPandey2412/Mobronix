// lib/sms.ts — pluggable SMS sender. Picks a provider from env vars at runtime.
//
// Supported (auto-detected, first one configured wins):
//   • Twilio   — TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (or TWILIO_MESSAGING_SERVICE_SID)
//   • MSG91    — MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_OTP_TEMPLATE_ID   (India / DLT)
//   • Fast2SMS — FAST2SMS_API_KEY                                          (India)
//   • (none)   — TERMINAL fallback: logs to the server console (dev only)
//
// All senders take an E.164-ish number. Our app collects 10-digit Indian numbers,
// so we default the country code to +91 (override with SMS_COUNTRY_CODE).

const CC = process.env.SMS_COUNTRY_CODE || '91'

export type SmsResult = { ok: true; provider: string } | { ok: false; provider: string; error: string }

function e164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '')
  return digits.startsWith(CC) ? `+${digits}` : `+${CC}${digits}`
}

export function activeSmsProvider(): 'twilio' | 'msg91' | 'fast2sms' | 'terminal' {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) return 'twilio'
  if (process.env.MSG91_AUTH_KEY) return 'msg91'
  if (process.env.FAST2SMS_API_KEY) return 'fast2sms'
  return 'terminal'
}

async function sendTwilio(mobile: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!
  const auth = process.env.TWILIO_AUTH_TOKEN!
  const params = new URLSearchParams({ To: e164(mobile), Body: body })
  const svc = process.env.TWILIO_MESSAGING_SERVICE_SID
  if (svc) params.set('MessagingServiceSid', svc)
  else params.set('From', process.env.TWILIO_FROM || '')
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${auth}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  if (!res.ok) return { ok: false, provider: 'twilio', error: `Twilio ${res.status}` }
  return { ok: true, provider: 'twilio' }
}

async function sendMsg91(mobile: string, otp: string): Promise<SmsResult> {
  // MSG91 OTP API — requires a DLT-approved template that contains ##OTP##.
  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { authkey: process.env.MSG91_AUTH_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: process.env.MSG91_OTP_TEMPLATE_ID,
      sender:      process.env.MSG91_SENDER_ID,
      mobile:      `${CC}${mobile.replace(/\D/g, '')}`,
      otp,
    }),
  })
  if (!res.ok) return { ok: false, provider: 'msg91', error: `MSG91 ${res.status}` }
  return { ok: true, provider: 'msg91' }
}

async function sendFast2Sms(mobile: string, otp: string): Promise<SmsResult> {
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: process.env.FAST2SMS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: mobile.replace(/\D/g, '') }),
  })
  if (!res.ok) return { ok: false, provider: 'fast2sms', error: `Fast2SMS ${res.status}` }
  return { ok: true, provider: 'fast2sms' }
}

/** Send an OTP. `message` is the full SMS text; `otp` is the bare code (some
 *  providers like MSG91/Fast2SMS take the code, not the text). */
export async function sendOtpSms(mobile: string, otp: string, message: string): Promise<SmsResult> {
  const provider = activeSmsProvider()
  try {
    if (provider === 'twilio')   return await sendTwilio(mobile, message)
    if (provider === 'msg91')    return await sendMsg91(mobile, otp)
    if (provider === 'fast2sms') return await sendFast2Sms(mobile, otp)
    // TERMINAL fallback (dev) — never use in production.
    console.log(`\n========================================`)
    console.log(`📱  OTP for +${CC} ${mobile}:  ${otp}`)
    console.log(`    (no SMS provider configured — terminal only)`)
    console.log(`========================================\n`)
    return { ok: true, provider: 'terminal' }
  } catch (e: any) {
    return { ok: false, provider, error: e?.message || 'SMS send failed' }
  }
}
