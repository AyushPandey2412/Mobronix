'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastHost'
import { cn } from '@/lib/utils'
import { inr } from '@/lib/format'
import {
  QK,
  bulkUpdateEnquiryStatus,
  bulkDeleteEnquiries,
} from '@/lib/adminQueries'
import { ACTIVE_ENQUIRY_STATUSES, ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from '@/lib/enquiryStatus'
import type { Enquiry, EnquiryStatus } from '@/lib/types'

type Filter = 'all' | EnquiryStatus
type Sort   = 'newest' | 'oldest' | 'amount_asc' | 'amount_desc'

const STATUS: Record<string, { label: string; cls: string }> = {
  new:               { label: 'New',               cls: 'bg-warning-50 text-warning-700 ring-warning-200'   },
  contacted:         { label: 'Contacted',         cls: 'bg-primary-50 text-primary-700 ring-primary-200'   },
  pickup_scheduled:  { label: 'Pickup Scheduled',  cls: 'bg-primary-50 text-primary-700 ring-primary-200'   },
  inspection:        { label: 'Inspection',        cls: 'bg-warning-50 text-warning-700 ring-warning-200'   },
  price_confirmed:   { label: 'Price Confirmed',   cls: 'bg-warning-50 text-warning-700 ring-warning-200'   },
  payment_completed: { label: 'Payment Completed', cls: 'bg-success-50 text-success-700 ring-success-200'   },
  completed:         { label: 'Completed',         cls: 'bg-success-50 text-success-700 ring-success-200'   },
  cancelled:         { label: 'Cancelled',         cls: 'bg-neutral-100 text-neutral-500 ring-neutral-200'  },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-neutral-100 text-neutral-500 ring-neutral-200' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold ring-1 ring-inset', s.cls)}>
      {s.label}
    </span>
  )
}

export default function Dashboard({
  enquiries,
  title = 'Dashboard',
  subtitle = 'All enquiries, live data',
}: {
  enquiries: Enquiry[]
  title?: string
  subtitle?: string
}) {
  const sb          = useMemo(() => createBrowserClient(), [])
  const toast       = useToast()
  const qc          = useQueryClient()

  const [filter,   setFilter]   = useState<Filter>('all')
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState<Sort>('newest')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page,     setPage]     = useState(1)
  const [newBadge, setNewBadge] = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => {
    const channel = sb
      .channel('admin-enquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, (payload) => {
        qc.invalidateQueries({ queryKey: QK.enquiries() })
        if (payload.eventType === 'INSERT') {
          setNewBadge((count) => count + 1)
          toast('New enquiry received', 'info')
        }
      })
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [sb, qc, toast])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     enquiries.length,
    pending:   enquiries.filter(e => e.status === 'new').length,
    accepted:  enquiries.filter(e => e.status === 'contacted').length,
    completed: enquiries.filter(e => e.status === 'completed').length,
    pipeline:  enquiries
      .filter(e => ACTIVE_ENQUIRY_STATUSES.includes(e.status))
      .reduce((s, e) => s + (e.total_amount ?? 0), 0),
  }), [enquiries])

  const chart = useMemo(() => {
    const days: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        count: enquiries.filter(e => e.created_at?.slice(0,10) === d.toISOString().slice(0,10)).length,
      })
    }
    return days
  }, [enquiries])
  const maxCount = Math.max(1, ...chart.map(d => d.count))

  const counts: Record<string, number> = useMemo(() => {
    const result: Record<string, number> = { all: enquiries.length }
    ENQUIRY_STATUSES.forEach((status) => {
      result[status] = enquiries.filter(e => e.status === status).length
    })
    return result
  }, [enquiries])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(e =>
      (e.display_id ?? '').toLowerCase().includes(q) ||
      (e.profile?.full_name ?? e.guest_name ?? '').toLowerCase().includes(q) ||
      (e.profile?.phone ?? e.guest_phone ?? '').includes(q))
    return [...list].sort((a, b) => {
      if (sort === 'amount_asc')  return (a.total_amount ?? 0) - (b.total_amount ?? 0)
      if (sort === 'amount_desc') return (b.total_amount ?? 0) - (a.total_amount ?? 0)
      const da = +new Date(a.created_at ?? ''), db = +new Date(b.created_at ?? '')
      return sort === 'oldest' ? da - db : db - da
    })
  }, [enquiries, filter, search, sort])

  // Reset to page 1 AND clear selection when the filter context changes, so a
  // bulk action can never silently hit rows that are no longer in view.
  useEffect(() => { setPage(1); setSelected(new Set()) }, [filter, search, sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage  = Math.min(page, pageCount)
  const paged     = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  // Keep page state in sync when the row count shrinks (e.g. after a delete),
  // otherwise `page` and the displayed `safePage` diverge → a dead "Prev" click.
  useEffect(() => { if (page !== safePage) setPage(safePage) }, [page, safePage])

  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // ── Mutations ──────────────────────────────────────────────────────────────
  const bulkStatusMutation = useMutation({
    mutationFn: (status: EnquiryStatus) =>
      bulkUpdateEnquiryStatus(sb, { ids: [...selected], status }),
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: QK.enquiries() })
      toast(`Marked ${selected.size} as ${status}`, 'success')
      setSelected(new Set())
    },
    onError: (e: any) => toast(e.message ?? 'Update failed', 'error'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteEnquiries(sb, [...selected]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.enquiries() })
      toast(`Deleted ${selected.size}`, 'info')
      setSelected(new Set())
    },
    onError: (e: any) => toast(e.message ?? 'Delete failed', 'error'),
  })

  function exportCsv() {
    const rows = filtered.filter(e => selected.size === 0 || selected.has(e.id))
    const cell = (v: unknown) => {
      let s = String(v ?? '')
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s                 // formula-injection guard
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const fmtDate = (iso?: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      return isNaN(d.getTime()) ? iso : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    const cap = (s?: EnquiryStatus) => (s ? ENQUIRY_STATUS_LABELS[s] : '')
    const header = ['Enquiry ID', 'Name', 'Phone', 'Devices', 'Total (₹)', 'Status', 'Pincode', 'Submitted']
    const lines = rows.map(e => {
      const name  = e.profile?.full_name || e.guest_name  || ''
      const phone = e.profile?.phone     || e.guest_phone || ''
      const devices = ((e.devices ?? []) as any[]).map(d => [d.model, d.variant, d.chip, d.storage].filter(Boolean).join(' ')).join(' | ')
      return [e.display_id, name, phone, devices, e.total_amount ?? 0, cap(e.status), e.pincode, fmtDate(e.created_at)].map(cell).join(',')
    })
    const csv = '﻿' + [header.join(','), ...lines].join('\r\n')   // BOM for Excel/₹
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'enquiries.csv'
    a.click()
  }

  return (
    <div className="space-y-6 max-w-6xl fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-extrabold text-text-primary tracking-tight">{title}</h1>
          <p className="text-body-sm text-text-tertiary mt-0.5">{subtitle}</p>
          {newBadge > 0 && (
            <button
              onClick={() => setNewBadge(0)}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-warning-50 px-2.5 py-1 text-caption font-semibold text-warning-700 ring-1 ring-warning-200">
              <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
              {newBadge} new enquir{newBadge === 1 ? 'y' : 'ies'}
            </button>
          )}
        </div>
        <button onClick={exportCsv}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-neutral-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total',     value: stats.total,     cls: 'text-text-primary' },
          { label: 'New',       value: stats.pending,   cls: 'text-warning-600'  },
          { label: 'Contacted', value: stats.accepted,  cls: 'text-brand'        },
          { label: 'Completed', value: stats.completed, cls: 'text-success-600'  },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-caption text-text-tertiary font-medium uppercase tracking-wide">{s.label}</p>
            <p className={cn('text-[2rem] font-extrabold tracking-tight mt-1 leading-none font-sans', s.cls)}>{s.value}</p>
          </div>
        ))}
        <div className="rounded-lg border border-success-200 bg-success-50 p-4 col-span-2 sm:col-span-1">
          <p className="text-caption text-success-600 font-medium uppercase tracking-wide">Pipeline</p>
          <p className="text-xl font-extrabold text-success-700 mt-1 leading-tight font-sans">{inr(stats.pipeline)}</p>
        </div>
      </div>

      {/* Table + chart */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-border flex flex-wrap gap-2 items-center bg-neutral-50/50">
            <div className="flex flex-wrap gap-1">
              {(['all', ...ENQUIRY_STATUSES] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('h-7 px-3 rounded-md text-caption font-semibold capitalize transition-colors',
                    filter === f ? 'bg-brand text-white shadow-xs' : 'text-text-tertiary hover:text-text-primary hover:bg-neutral-100')}>
                  {f === 'all' ? 'All' : ENQUIRY_STATUS_LABELS[f as EnquiryStatus]} <span className="opacity-60">{counts[f]??0}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="h-7 bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-3 text-caption outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] w-36 transition-all" />
              <select value={sort} onChange={e => setSort(e.target.value as Sort)}
                className="h-7 bg-surface border border-border text-text-secondary rounded-md px-2 text-caption outline-none focus:border-brand">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount_desc">Highest</option>
                <option value="amount_asc">Lowest</option>
              </select>
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="px-4 py-2 bg-primary-50 border-b border-primary-100 flex flex-wrap items-center gap-2">
              <span className="text-brand text-caption font-bold">{selected.size} selected</span>
              <span className="text-border-strong">·</span>
              {(['contacted','pickup_scheduled','price_confirmed','completed','cancelled'] as EnquiryStatus[]).map(s => (
                <button key={s} onClick={() => bulkStatusMutation.mutate(s)}
                  disabled={bulkStatusMutation.isPending}
                  className="h-6 px-2.5 rounded bg-surface border border-border text-caption font-medium text-text-secondary hover:text-text-primary capitalize transition-colors disabled:opacity-50">
                  {ENQUIRY_STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => {
                  if (confirm(`Delete ${selected.size} enquir${selected.size===1?'y':'ies'}?`)) {
                    bulkDeleteMutation.mutate()
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
                className="h-6 px-2.5 rounded bg-error-50 border border-error-200 text-caption font-medium text-error-700 hover:bg-error-100 transition-colors ml-auto disabled:opacity-50">
                {bulkDeleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-text-tertiary text-body-sm">No enquiries match.</p>
              </div>
            )}
            {paged.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group">
                <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)}
                  className="h-4 w-4 rounded accent-brand opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0" />
                <Link href={`/admin/orders/${e.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-text-tertiary">{e.display_id}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-body-sm text-text-primary font-medium truncate mt-0.5">
                      {e.profile?.full_name || e.guest_name || '—'}
                      {(e.devices ?? []).length > 0 && (
                        <span className="text-text-tertiary font-normal"> · {(e.devices as any[]).map((d:any)=>d.model).join(', ')}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-sans text-body-sm font-bold text-text-primary">{inr(e.total_amount ?? 0)}</p>
                    <p className="text-caption text-text-tertiary">{new Date(e.created_at ?? '').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-text-disabled group-hover:text-text-tertiary transition-colors flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-neutral-50/50 flex items-center justify-between gap-3">
            <span className="text-caption text-text-tertiary">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {filtered.length > PAGE_SIZE && <> · showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</>}
            </span>
            <div className="flex items-center gap-3">
              {pageCount > 1 && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}
                    className="h-6 px-2 rounded border border-border text-caption font-medium text-text-secondary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                  <span className="text-caption text-text-tertiary tabular-nums">{safePage} / {pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount}
                    className="h-6 px-2 rounded border border-border text-caption font-medium text-text-secondary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                </div>
              )}
              <button onClick={exportCsv} className="text-caption text-text-tertiary hover:text-brand transition-colors font-medium">Export filtered</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <p className="text-label font-semibold text-text-secondary mb-4">Last 7 days</p>
            <div className="flex items-end gap-1.5 h-20">
              {chart.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {d.count > 0 && <span className="text-[9px] text-text-tertiary font-mono">{d.count}</span>}
                  <div className="w-full rounded-t transition-all"
                    style={{ height: `${Math.max(3, (d.count/maxCount)*64)}px`, background: d.count > 0 ? 'var(--brand)' : 'var(--border)' }} />
                  <span className="text-[9px] text-text-tertiary">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <p className="text-label font-semibold text-text-secondary mb-3">Status breakdown</p>
            <div className="space-y-2.5">
              {Object.entries(STATUS).map(([key, s]) => {
                const count = counts[key] ?? 0
                const pct = stats.total > 0 ? Math.round((count/stats.total)*100) : 0
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className="text-caption text-text-secondary w-20 capitalize">{s.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full rounded-full bg-brand/40 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-caption font-mono text-text-tertiary w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
