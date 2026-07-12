'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastHost'
import BottomSheet from '@/components/ui/BottomSheet'
import { cn } from '@/lib/utils'
import { inr } from '@/lib/format'
import { QK, QK_PUBLIC, upsertModel, patchModel } from '@/lib/adminQueries'
import type { Model, ModelCategory, FlatStorages, NestedStorages } from '@/lib/types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function flatTierChips(m: Model): string[] {
  const out: string[] = []
  for (const [k, v] of Object.entries(m.storages)) {
    if (typeof v === 'number') out.push(`${k} ${inr(v)}`)
    else for (const [s, p] of Object.entries(v as Record<string,number>)) out.push(`${k}/${s} ${inr(p)}`)
  }
  return out
}

export default function ProductsClient({ models }: { models: Model[] }) {
  const sb    = useMemo(() => createBrowserClient(), [])
  const toast = useToast()
  const qc    = useQueryClient()

  const [cat,      setCat]      = useState<ModelCategory>('iphone')
  const [editing,  setEditing]  = useState<Model | null>(null)
  const [creating, setCreating] = useState(false)

  const list = models.filter(m => m.category === cat).sort((a,b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  // ── Mutations ──────────────────────────────────────────────────────────────
  const toggleActiveMutation = useMutation({
    mutationFn: (m: Model) => patchModel(sb, { id: m.id, patch: { is_active: !m.is_active } }),
    onSuccess: (_,m) => {
      qc.invalidateQueries({ queryKey: QK.models() })
      qc.invalidateQueries({ queryKey: QK_PUBLIC.models() })
      toast(m.is_active ? 'Hidden' : 'Made active', 'success')
    },
    onError: (e: any) => toast(e.message, 'error'),
  })

  const moveMutation = useMutation({
    mutationFn: ({ m, dir }: { m: Model; dir: -1|1 }) =>
      patchModel(sb, { id: m.id, patch: { sort_order: (m.sort_order ?? 0) + dir } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.models() }); qc.invalidateQueries({ queryKey: QK_PUBLIC.models() }) },
    onError:   (e: any) => toast(e.message, 'error'),
  })

  return (
    <div className="space-y-5 max-w-4xl fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-extrabold text-text-primary tracking-tight">Products</h1>
          <p className="text-body-sm text-text-tertiary mt-0.5">Manage your buyback catalog</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-body-sm transition-colors shadow-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add model
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit">
        {(['iphone','macbook'] as ModelCategory[]).map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn('px-4 py-1.5 rounded-md text-body-sm font-medium transition-all',
              cat === c ? 'bg-surface text-text-primary shadow-xs' : 'text-text-tertiary hover:text-text-primary')}>
            {c === 'iphone' ? 'iPhone' : 'MacBook'}
          </button>
        ))}
      </div>

      {/* Model list */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {list.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-text-tertiary text-body-sm">No {cat} models yet.</p>
            <button onClick={() => setCreating(true)} className="mt-3 text-brand text-body-sm font-medium hover:underline">Add the first one</button>
          </div>
        )}
        <div className="divide-y divide-border">
          {list.map(m => (
            <div key={m.id} className={cn('flex items-center gap-3 px-4 py-3.5', !m.is_active && 'opacity-50')}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveMutation.mutate({ m, dir: -1 })} disabled={moveMutation.isPending}
                  className="w-6 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-text-disabled hover:text-text-secondary transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button onClick={() => moveMutation.mutate({ m, dir: 1 })} disabled={moveMutation.isPending}
                  className="w-6 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-text-disabled hover:text-text-secondary transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-body-sm font-semibold text-text-primary">{m.name}</p>
                  <span className="text-caption text-text-tertiary">{m.series}</span>
                  {m.chips && <span className="text-caption text-text-tertiary">· {m.chips.join(' / ')}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {flatTierChips(m).slice(0, 5).map((c, i) => (
                    <span key={i} className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">{c}</span>
                  ))}
                  {flatTierChips(m).length > 5 && <span className="text-[10px] text-text-tertiary">+{flatTierChips(m).length - 5} more</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActiveMutation.mutate(m)}
                  disabled={toggleActiveMutation.isPending}
                  className={cn('h-7 px-2.5 rounded-md text-caption font-medium border transition-colors disabled:opacity-50',
                    m.is_active
                      ? 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100'
                      : 'bg-neutral-100 text-text-tertiary border-border hover:bg-neutral-200')}>
                  {m.is_active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => setEditing(m)}
                  className="h-7 px-2.5 rounded-md text-caption font-medium border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-neutral-50 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(editing || creating) && (
        <ModelEditor
          sb={sb} toast={toast} qc={qc} category={cat} model={editing}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </div>
  )
}

function ModelEditor({ sb, toast, qc, category, model, onClose }: any) {
  const isMac = category === 'macbook'
  const [name,   setName]   = useState(model?.name || '')
  const [series, setSeries] = useState(model?.series || (isMac ? 'MacBook Air' : '16 Series'))
  const [chips,  setChips]  = useState<string[]>(model?.chips || (isMac ? ['M1'] : []))
  const [flatRows,   setFlatRows]   = useState<{ tier: string; price: number }[]>(
    !isMac && model ? Object.entries(model.storages as FlatStorages).map(([tier, price]) => ({ tier, price: price as number })) : [{ tier: '128GB', price: 0 }]
  )
  const [nestedRows, setNestedRows] = useState<{ chip: string; tier: string; price: number }[]>(() => {
    if (isMac && model) {
      const out: any[] = []
      for (const [chip, tiers] of Object.entries(model.storages as NestedStorages))
        for (const [tier, price] of Object.entries(tiers)) out.push({ chip, tier, price })
      return out.length ? out : [{ chip: chips[0] || 'M1', tier: '256GB', price: 0 }]
    }
    return [{ chip: 'M1', tier: '256GB', price: 0 }]
  })

  const inputCls  = "w-full h-10 bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-3 text-body-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] transition-all"
  const smallCls  = "h-9 bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-2.5 text-body-sm outline-none focus:border-brand transition-all"

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!name.trim()) throw new Error('Enter a model name')
      let storages: any
      if (isMac) {
        storages = {}
        for (const r of nestedRows) { if (!r.tier) continue; (storages[r.chip] ||= {})[r.tier] = Number(r.price) || 0 }
      } else {
        storages = {}
        for (const r of flatRows) { if (r.tier) storages[r.tier] = Number(r.price) || 0 }
      }
      const payload: any = {
        name, series, category, slug: model?.slug || slugify(name),
        chips: isMac ? chips : null, rams: model?.rams ?? null, variants: model?.variants ?? null,
        storages, is_active: model?.is_active ?? true, sort_order: model?.sort_order ?? 0,
      }
      return upsertModel(sb, { payload, existingId: model?.id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.models() })
      qc.invalidateQueries({ queryKey: QK_PUBLIC.models() })
      toast('Saved', 'success')
      onClose()
    },
    onError: (e: any) => toast(e.message, 'error'),
  })

  return (
    <BottomSheet open onClose={onClose} title={model ? `Edit ${model.name}` : 'Add model'}>
      <div className="space-y-3">
        <div><label className="block text-caption font-medium text-text-secondary mb-1">Model name</label>
          <input className={inputCls} placeholder="e.g. iPhone 16 Pro" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="block text-caption font-medium text-text-secondary mb-1">Series</label>
          <input className={inputCls} placeholder="e.g. 16 Series" value={series} onChange={e => setSeries(e.target.value)} /></div>

        {isMac && (
          <div><label className="block text-caption font-medium text-text-secondary mb-1">Chips (comma-separated)</label>
            <input className={inputCls} placeholder="M1, M2, M3" value={chips.join(', ')} onChange={e => setChips(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></div>
        )}

        {isMac ? (
          <div><label className="block text-caption font-medium text-text-secondary mb-1">Storage / price matrix</label>
            <div className="space-y-2">
              {nestedRows.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <select value={r.chip} onChange={e => setNestedRows(rs=>rs.map((x,j)=>j===i?{...x,chip:e.target.value}:x))} className={cn(smallCls,'w-24')}>
                    {chips.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={r.tier} onChange={e=>setNestedRows(rs=>rs.map((x,j)=>j===i?{...x,tier:e.target.value}:x))} placeholder="256GB" className={cn(smallCls,'w-20')}/>
                  <input type="number" value={r.price} onChange={e=>setNestedRows(rs=>rs.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))} placeholder="Price" className={cn(smallCls,'flex-1 font-mono')}/>
                  <button onClick={()=>setNestedRows(rs=>rs.filter((_,j)=>j!==i))} className="w-8 text-error-600 hover:text-error-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={()=>setNestedRows(rs=>[...rs,{chip:chips[0]||'M1',tier:'',price:0}])} className="text-brand text-body-sm font-medium hover:underline">+ Add row</button>
            </div>
          </div>
        ) : (
          <div><label className="block text-caption font-medium text-text-secondary mb-1">Storage / price</label>
            <div className="space-y-2">
              {flatRows.map((r,i)=>(
                <div key={i} className="flex gap-2">
                  <input value={r.tier} onChange={e=>setFlatRows(rs=>rs.map((x,j)=>j===i?{...x,tier:e.target.value}:x))} placeholder="128GB" className={cn(smallCls,'w-24')}/>
                  <input type="number" value={r.price} onChange={e=>setFlatRows(rs=>rs.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))} placeholder="Price" className={cn(smallCls,'flex-1 font-mono')}/>
                  <button onClick={()=>setFlatRows(rs=>rs.filter((_,j)=>j!==i))} className="w-8 text-error-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={()=>setFlatRows(rs=>[...rs,{tier:'',price:0}])} className="text-brand text-body-sm font-medium hover:underline">+ Add storage</button>
            </div>
          </div>
        )}

        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="w-full h-10 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold rounded-md text-body-sm transition-colors shadow-xs flex items-center justify-center gap-2">
          {saveMutation.isPending && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeLinecap="round"/></svg>}
          {saveMutation.isPending ? 'Saving…' : 'Save model'}
        </button>
      </div>
    </BottomSheet>
  )
}
