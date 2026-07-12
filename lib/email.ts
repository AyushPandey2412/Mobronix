// lib/email.ts — transactional email via Resend.
// All templates use INLINE styles only (no Tailwind / external CSS in email HTML).
import { Resend } from 'resend'
import type { Enquiry } from './types'

const ACCENT = '#16A34A'
const INK = '#171A21'
const FROM = 'SellMyiPhone <noreply@sellmyiphone.in>'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send')
    return null
  }
  return new Resend(key)
}

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function deviceLines(enquiry: Enquiry): string {
  return (enquiry.devices ?? [])
    .map((d: any) => {
      const extra = [d.variant, d.chip, d.ram].filter(Boolean).join(' · ')
      const sub = extra ? `${extra} · ${d.storage}` : d.storage
      return `<tr>
        <td style="padding:8px 0;color:${INK};font-size:14px">${d.model} <span style="color:#667085">(${sub})</span></td>
        <td style="padding:8px 0;text-align:right;font-weight:700;color:${INK};font-family:monospace">${inr(d.final)}</td>
      </tr>`
    })
    .join('')
}

function shell(title: string, inner: string): string {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E4E7EB;border-radius:16px;overflow:hidden">
    <div style="background:${ACCENT};padding:20px 24px"><span style="color:#fff;font-size:18px;font-weight:800">SellMyiPhone</span></div>
    <div style="padding:24px">
      <h2 style="margin:0 0 12px;color:${INK};font-size:20px">${title}</h2>
      ${inner}
    </div>
    <div style="padding:16px 24px;background:#F6F8F7;color:#94A0AF;font-size:12px">Made in Mumbai · SellMyiPhone</div>
  </div>`
}

export async function sendAdminNotification(enquiry: Enquiry, adminBaseUrl: string): Promise<void> {
  const resend = getResend()
  if (!resend) return
  const link = `${adminBaseUrl}/admin/orders/${enquiry.id}`
  const inner = `
    <p style="color:#667085;font-size:14px">A new enquiry was submitted.</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">${deviceLines(enquiry)}
      <tr><td style="padding:12px 0;border-top:1px solid #E4E7EB;font-weight:700">Total estimate</td>
      <td style="padding:12px 0;border-top:1px solid #E4E7EB;text-align:right;font-weight:800;font-family:monospace">${inr(enquiry.total_amount ?? 0)}</td></tr>
    </table>
    <p style="color:#667085;font-size:14px"><b>Customer:</b> ${enquiry.profile?.full_name ?? '—'} · ${enquiry.profile?.phone ?? '—'}<br/>
    <b>Pickup:</b> ${enquiry.pickup_slot}<br/>
    <b>Address:</b> ${enquiry.address}, ${enquiry.pincode}<br/>
    <b>Payment:</b> ${enquiry.payment_mode}</p>
    <a href="${link}" style="display:inline-block;margin-top:12px;background:${ACCENT};color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Open in Admin →</a>`
  await resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL || 'admin@sellmyiphone.in',
    subject: `New Enquiry ${enquiry.display_id}`,
    html: shell(`New enquiry ${enquiry.display_id}`, inner)
  })
}

export async function sendCustomerConfirmation(enquiry: Enquiry, customerEmail: string): Promise<void> {
  const resend = getResend()
  if (!resend || !customerEmail) return
  const inner = `
    <p style="color:#667085;font-size:14px">We've received your request. Our spokesperson will call within 2 hours to confirm your pickup slot.</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">${deviceLines(enquiry)}
      <tr><td style="padding:12px 0;border-top:1px solid #E4E7EB;font-weight:700">Total estimate</td>
      <td style="padding:12px 0;border-top:1px solid #E4E7EB;text-align:right;font-weight:800;font-family:monospace">${inr(enquiry.total_amount ?? 0)}</td></tr>
    </table>
    <p style="color:#667085;font-size:13px">Your enquiry ID is <b style="color:${INK};font-family:monospace">${enquiry.display_id}</b>. Price is valid for 24 hours. At pickup, if the device condition differs from what you described, our executive may re-quote — you can accept or cancel, no obligation.</p>`
  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `We've received your request — ${enquiry.display_id}`,
    html: shell('Request received', inner)
  })
}

export async function sendStatusUpdateEmail(
  enquiry: Enquiry,
  customerEmail: string,
  newStatus: string,
  newStep: number
): Promise<void> {
  const resend = getResend()
  if (!resend || !customerEmail) return
  const stepLabels = ['Request Submitted', 'Enquiry Accepted', 'Pickup Scheduled', 'Device Inspected', 'Payment Completed']
  const inner = `
    <p style="color:#667085;font-size:14px">Your enquiry <b style="font-family:monospace">${enquiry.display_id}</b> has been updated.</p>
    <p style="font-size:15px"><b>Status:</b> ${newStatus}<br/><b>Stage:</b> ${stepLabels[newStep] ?? newStep}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/track" style="display:inline-block;margin-top:8px;background:${ACCENT};color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Track your order →</a>`
  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Update on your enquiry ${enquiry.display_id}`,
    html: shell('Enquiry updated', inner)
  })
}
