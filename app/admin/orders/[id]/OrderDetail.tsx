'use client'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastHost'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { inr } from '@/lib/format'
import {
  QK,
  fetchEnquiryHistory,
  updateEnquiryStatus,
  deleteEnquiry,
} from '@/lib/adminQueries'
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS, normalizeLegacyStatus } from '@/lib/enquiryStatus'
import { TRACKING_STEPS, type Enquiry, type EnquiryDevice, type EnquiryHistory, type EnquiryStatus } from '@/lib/types'

const ADMIN_STATUSES: EnquiryStatus[] = [...ENQUIRY_STATUSES]

const STATUS: Record<string, { label: string; cls: string }> = {
  new:               { label: 'New',               cls: 'bg-warning-50 text-warning-700 ring-warning-200'  },
  contacted:         { label: 'Contacted',         cls: 'bg-primary-50 text-primary-700 ring-primary-200'  },
  pickup_scheduled:  { label: 'Pickup Scheduled',  cls: 'bg-primary-50 text-primary-700 ring-primary-200'  },
  inspection:        { label: 'Inspection',        cls: 'bg-warning-50 text-warning-700 ring-warning-200'  },
  price_confirmed:   { label: 'Price Confirmed',   cls: 'bg-warning-50 text-warning-700 ring-warning-200'  },
  payment_completed: { label: 'Payment Completed', cls: 'bg-success-50 text-success-700 ring-success-200'  },
  completed:         { label: 'Completed',         cls: 'bg-success-50 text-success-700 ring-success-200'  },
  cancelled:         { label: 'Cancelled',         cls: 'bg-neutral-100 text-neutral-500 ring-neutral-200' },
}

type DevicePhoto = { slot: string; url: string }
type DeviceSummary = Partial<EnquiryDevice> & {
  model?: string
  storage?: string
  base?: number
  final?: number
}

export default function OrderDetail({
  enquiry: initial,
  history: initialHistory,
  photos = [],
}: {
  enquiry: Enquiry
  history: EnquiryHistory[]
  photos?: DevicePhoto[]
}) {
  const sb     = useMemo(() => createBrowserClient(), [])
  const router = useRouter()
  const toast  = useToast()
  const qc     = useQueryClient()

  const [status,     setStatus]     = useState<EnquiryStatus>(normalizeLegacyStatus(initial.status))
  const [step,       setStep]       = useState(initial.tracking_step ?? 0)
  const [note,       setNote]       = useState(initial.internal_note || '')
  const [confirmDel, setConfirmDel] = useState(false)

  // ── Refetch history from Supabase (always fresh) ──────────────────────────
  const { data: history = initialHistory } = useQuery({
    queryKey: QK.enquiryHistory(initial.id),
    queryFn:  () => fetchEnquiryHistory(sb, initial.id),
    initialData: initialHistory,
  })

  // Prefer the linked profile (authenticated sellers); fall back to the guest
  // contact captured at checkout (migration 007) so guest phones still show.
  const fullName    = initial.profile?.full_name || initial.guest_name || ''
  const phoneRaw    = initial.profile?.phone || initial.guest_phone || ''
  const firstName   = (fullName || 'there').split(' ')[0]
  const phone       = phoneRaw.replace(/\D/g, '') || ''
  const devices     = (initial.devices ?? []) as DeviceSummary[]
  const deviceLabel = devices.map((device) => device.model).filter(Boolean).join(', ')

  // ── Mutations ──────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateEnquiryStatus(sb, { id: initial.id, status, step, note })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.enquiries() })
      qc.invalidateQueries({ queryKey: QK.enquiryHistory(initial.id) })
      toast('Saved', 'success')
    },
    onError: (error: Error) => toast(error.message ?? 'Save failed', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEnquiry(sb, initial.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.enquiries() })
      toast('Enquiry deleted', 'info')
      router.push('/admin')
    },
    onError: (error: Error) => toast(error.message ?? 'Delete failed', 'error'),
  })

  const waMessages = [
    { key: 'contacted', label: 'Contacted',       text: `Hi ${firstName}, your ${deviceLabel} sell request (#${initial.display_id}) has been received. Our spokesperson will call you shortly.` },
    { key: 'price',    label: 'Price Confirmed',   text: `Hi ${firstName}, your price of ${inr(initial.total_amount ?? 0)} for ${deviceLabel} has been confirmed.` },
    { key: 'pickup',   label: 'Pickup Scheduled',  text: `Hi ${firstName}, our executive is scheduled to pick up your ${deviceLabel} today at your chosen slot.` },
    { key: 'paid',     label: 'Payment Completed', text: `Hi ${firstName}, payment of ${inr(initial.total_amount ?? 0)} is done! Thank you for choosing us.` },
    { key: 'cancelled', label: 'Cancelled',        text: `Hi ${firstName}, your ${deviceLabel} sell request (#${initial.display_id}) has been cancelled. Please contact us for details.` },
  ]

  const statusCfg = STATUS[normalizeLegacyStatus(initial.status)]

  return (
    <div className="max-w-3xl space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-body-sm text-text-tertiary hover:text-text-primary transition-colors font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <span className="text-border-strong">/</span>
        <div className="flex items-center gap-2.5">
          <h1 className="text-h4 font-extrabold text-text-primary tracking-tight">
            Enquiry <span className="font-mono text-text-secondary">{initial.display_id}</span>
          </h1>
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold ring-1 ring-inset', statusCfg.cls)}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Tracking steps */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <p className="text-label font-semibold text-text-secondary mb-4">Tracking progress</p>
        <div className="flex items-center">
          {TRACKING_STEPS.map((label, i) => {
            const done = i < step, current = i === step
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                    done ? 'bg-brand text-white' : current ? 'bg-primary-50 text-brand ring-2 ring-brand ring-offset-1' : 'bg-neutral-100 text-text-disabled')}>
                    {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> : i+1}
                  </div>
                  <span className={cn('text-[10px] font-medium text-center max-w-[60px] leading-tight hidden sm:block', current ? 'text-brand' : done ? 'text-text-secondary' : 'text-text-disabled')}>{label}</span>
                </div>
                {i < TRACKING_STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mx-1 rounded-full', done ? 'bg-brand' : 'bg-neutral-200')} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Customer */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
          <p className="text-label font-semibold text-text-secondary mb-3">Customer</p>
          <dl className="space-y-2.5">
            {[
              { label: 'Name',    value: fullName || '—' },
              { label: 'Phone',   value: phone ? <a href={`https://wa.me/91${phone}`} target="_blank" rel="noopener noreferrer" className="text-brand font-medium hover:underline">{phoneRaw}</a> : '—' },
              { label: 'Payment', value: initial.payment_mode ?? '—' },
              { label: 'Slot',    value: initial.pickup_slot  ?? '—' },
              { label: 'Address', value: `${initial.address ?? ''}, ${initial.pincode ?? ''}` },
              { label: 'Date',    value: initial.created_at ? new Date(initial.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—' },
            ].map((r: { label: string; value: ReactNode }) => (
              <div key={r.label} className="flex justify-between gap-2">
                <dt className="text-caption text-text-tertiary font-medium flex-shrink-0">{r.label}</dt>
                <dd className="text-caption text-text-primary font-medium text-right">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Devices */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
          <p className="text-label font-semibold text-text-secondary mb-3">Devices</p>
          <div className="space-y-3">
            {devices.map((d, i) => (
              <div key={i} className="rounded-lg bg-neutral-50 border border-border px-3 py-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{d.model}</p>
                    <p className="text-caption text-text-tertiary mt-0.5">{[d.variant, d.chip, d.storage].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-caption text-text-tertiary">Base {inr(d.base ?? 0)}</p>
                    <p className="text-body-sm font-bold text-success-600">{inr(d.final ?? 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-border mt-3 pt-3">
            <span className="text-body-sm font-semibold text-text-primary">Total</span>
            <span className="text-body-sm font-bold text-success-600">{inr(initial.total_amount ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Device photos */}
      {photos.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
          <p className="text-label font-semibold text-text-secondary mb-3">Device photos ({photos.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {photos.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                className="group block overflow-hidden rounded-lg border border-border bg-neutral-50">
                {/* Private-bucket signed URL — plain <img> (not next/image, which would
                    need the sign path whitelisted and re-sign on expiry). */}
                {/* eslint-disable-next-line @next/next/no-img-element -- signed private Supabase URLs expire and should not be proxied through next/image */}
                <img src={p.url} alt={p.slot}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
                <span className="block px-2 py-1.5 text-caption text-text-tertiary capitalize">{p.slot}</span>
              </a>
            ))}
          </div>
          <p className="mt-2 text-caption text-text-disabled">Links expire after 1 hour — refresh the page to regenerate.</p>
        </div>
      )}

      {/* Update status */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
        <p className="text-label font-semibold text-text-secondary">Update status</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-caption font-medium text-text-secondary block mb-1.5">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value as EnquiryStatus)}
              className="w-full h-10 bg-surface border border-border text-text-primary rounded-md px-3 text-body-sm outline-none focus:border-brand capitalize transition-all">
              {ADMIN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-caption font-medium text-text-secondary block mb-1.5">Tracking step</span>
            <select value={step} onChange={e => setStep(Number(e.target.value))}
              className="w-full h-10 bg-surface border border-border text-text-primary rounded-md px-3 text-body-sm outline-none focus:border-brand transition-all">
              {TRACKING_STEPS.map((l,i) => <option key={i} value={i}>{i} – {l}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-caption font-medium text-text-secondary block mb-1.5">
            Internal note
          </span>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Never shown to the customer"
            className="w-full bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-3 py-2.5 text-body-sm outline-none focus:border-brand resize-none transition-all" />
        </label>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="h-10 px-5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold rounded-md text-body-sm transition-colors shadow-xs flex items-center gap-2">
          {saveMutation.isPending && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeLinecap="round"/></svg>}
          {saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <p className="text-label font-semibold text-text-secondary mb-3">Notify via WhatsApp</p>
        <div className="flex flex-wrap gap-2">
          {waMessages.map(m => (
            <a key={m.key}
              href={phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(m.text)}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-caption font-medium text-text-secondary hover:text-success-700 hover:border-success-200 hover:bg-success-50 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-success-500">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.08.537 4.032 1.473 5.74L0 24l6.435-1.446A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.379l-.36-.214-3.718.835.888-3.617-.234-.372A9.818 9.818 0 012.182 12C2.182 6.588 6.588 2.182 12 2.182c5.41 0 9.818 4.406 9.818 9.818 0 5.41-4.408 9.818-9.818 9.818z"/>
              </svg>
              {m.label}
            </a>
          ))}
        </div>
      </div>

      {/* History — live via useQuery, refetches after save */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <p className="text-label font-semibold text-text-secondary mb-3">Activity history</p>
        {history.length === 0
          ? <p className="text-body-sm text-text-tertiary">No activity yet.</p>
          : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn('text-caption font-bold uppercase tracking-wide flex-shrink-0', h.actor === 'admin' ? 'text-brand' : 'text-text-tertiary')}>{h.actor}</span>
                    <span className="text-body-sm text-text-secondary truncate">{h.action}</span>
                  </div>
                  <span className="text-caption text-text-tertiary whitespace-nowrap flex-shrink-0">
                    {new Date(h.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-error-100 bg-error-50 p-5">
        <p className="text-label font-semibold text-error-700 mb-1">Danger zone</p>
        <p className="text-caption text-error-600/70 mb-3">This permanently removes the enquiry and its history.</p>
        <button onClick={() => setConfirmDel(true)}
          className="h-9 px-4 rounded-md bg-error-600 hover:bg-error-700 text-white text-body-sm font-medium transition-colors shadow-xs">
          Delete enquiry
        </button>
      </div>

      <ConfirmDialog open={confirmDel} title="Delete this enquiry?"
        message="This permanently removes the enquiry, photos, and history."
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDel(false)} />
    </div>
  )
}
