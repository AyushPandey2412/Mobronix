// GET /api/export?ids=uuid1,uuid2 — stream selected enquiries as CSV (admin only).
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { enquiryAmount } from '@/lib/enquiryPricing'
import { TRACKING_STEPS, type Enquiry } from '@/lib/types'
import { ENQUIRY_STATUS_STEPS, normalizeLegacyStatus, statusLabel } from '@/lib/enquiryStatus'

function csvCell(v: unknown): string {
  let s = String(v ?? '')
  // Neutralise CSV/formula injection: a leading =, +, -, @ (or tab/CR) can be
  // executed as a formula when the file is opened in Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Readable date for the CSV, e.g. "30 Jun 2026, 02:30 PM". */
function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export async function GET(req: Request) {
  const supabase = await createRouteClient()

  // Auth + admin role check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const idsParam = url.searchParams.get('ids')
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : []

  let query = supabase
    .from('enquiries')
    .select('display_id, total_amount, status, tracking_step, pickup_slot, payment_mode, address, pincode, created_at, devices, guest_name, guest_phone, profiles(full_name, phone)')
    .order('created_at', { ascending: false })
  if (ids.length) query = query.in('id', ids)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const header = ['Enquiry ID', 'Name', 'Phone', 'Devices', 'Total (₹)', 'Status', 'Stage', 'Pickup slot', 'Payment', 'Address', 'Pincode', 'Submitted']
  const rows = (data ?? []).map((e: any) => {
    // Fall back to the guest contact when there's no linked profile (guest orders).
    const name  = e.profiles?.full_name || e.guest_name  || ''
    const phone = e.profiles?.phone     || e.guest_phone || ''
    const devices = ((e.devices as Enquiry['devices']) ?? [])
      .map((d: any) => [d.model, d.variant, d.chip, d.storage].filter(Boolean).join(' '))
      .join(' | ')
    return [
      e.display_id,
      name,
      phone,
      devices,
      enquiryAmount(e as any),                              // raw number — spreadsheet-friendly
      statusLabel(normalizeLegacyStatus(e.status)),
      TRACKING_STEPS[ENQUIRY_STATUS_STEPS[normalizeLegacyStatus(e.status)] ?? 0],
      e.pickup_slot,
      e.payment_mode,
      e.address,
      e.pincode,
      fmtDate(e.created_at),
    ].map(csvCell).join(',')
  })

  // Prepend a UTF-8 BOM so Excel reads ₹ and other non-ASCII correctly.
  const csv = '﻿' + [header.join(','), ...rows].join('\r\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="enquiries.csv"'
    }
  })
}
