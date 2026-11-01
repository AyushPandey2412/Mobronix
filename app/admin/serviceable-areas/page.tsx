'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MapPin, Plus, Pencil, Search, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Area = { pincode: string; area_name: string; is_active: boolean }
type Filter = 'all' | 'active' | 'paused'

export default function ServiceableAreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [pincode, setPincode] = useState('')
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const formRef = useRef<HTMLFormElement>(null)
  const pinRef = useRef<HTMLInputElement>(null)
  const activeCount = areas.filter(area => area.is_active).length
  const duplicate = areas.some(area => area.pincode === pincode && area.pincode !== editing)
  const validPincode = /^[1-9]\d{5}$/.test(pincode)
  const filtered = areas.filter(area => (filter === 'all' || area.is_active === (filter === 'active')) && (area.pincode + ' ' + area.area_name).toLowerCase().includes(search.toLowerCase().trim()))

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/serviceable-areas', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    setAreas(data.areas)
  }, [])
  useEffect(() => { load().catch(e => setError(e.message)).finally(() => setLoading(false)) }, [load])

  function reset() { setEditing(null); setPincode(''); setName(''); setActive(true) }
  function edit(area: Area) {
    setEditing(area.pincode); setPincode(area.pincode); setName(area.area_name); setActive(area.is_active); setError(''); setNotice('')
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    pinRef.current?.focus({ preventScroll: true })
  }
  async function save(area: Area, method = 'PUT', original?: string) {
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/serviceable-areas', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...area, ...(original ? { original_pincode: original } : {}) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      await load()
      setNotice(method === 'DELETE' ? 'Pickup area removed.' : method === 'PATCH' ? 'Pickup area updated.' : 'Pickup area added.')
      return true
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); return false }
    finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-6xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-caption font-semibold uppercase tracking-wider text-brand">Pickup coverage</p><h1 className="text-h3 font-bold text-text-primary">Serviceable Areas</h1><p className="mt-1 text-body-sm text-text-secondary">Manage the pincodes where your team offers doorstep pickup.</p></div>
      <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-caption font-semibold text-brand">{loading ? 'Loading...' : activeCount + ' active areas'}</span>
    </header>
    {error && <div role="alert" className="rounded-lg border border-error-200 bg-error-50 p-3 text-body-sm text-error-700">{error}</div>}
    {notice && <div role="status" className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 p-3 text-body-sm text-brand"><Check size={16} />{notice}</div>}
    <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-5">
        <form ref={formRef} className="scroll-mt-5 rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm" onSubmit={async e => {
          e.preventDefault()
          if (duplicate || !validPincode) return
          if (await save({ pincode, area_name: name.trim(), is_active: active }, editing ? 'PATCH' : 'PUT', editing || undefined)) reset()
        }}>
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-brand">{editing ? <Pencil size={18} /> : <Plus size={18} />}</span>
            <div><h2 className="text-body-md font-bold text-text-primary">{editing ? 'Edit pickup area' : 'Add pickup area'}</h2><p className="text-caption text-text-secondary">{editing ? 'Update the details below.' : 'Set up a serviceable pincode.'}</p></div>
          </div>
          <Input ref={pinRef} label="Pincode" required pattern="[1-9][0-9]{5}" inputMode="numeric" maxLength={6} value={pincode} disabled={busy || loading} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 400001" hint="6-digit Indian postal code." error={duplicate ? 'This pincode already exists.' : pincode.length === 6 && !validPincode ? 'Pincode cannot start with 0.' : null} />
          <Input label="Area / city (optional)" maxLength={120} disabled={busy || loading} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fort, Mumbai" />
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span><span className="block text-body-sm font-semibold text-text-primary">Accept pickup requests</span><span className="block text-caption text-text-secondary">{active ? 'This area will be active.' : 'This area will be paused.'}</span></span>
            <input type="checkbox" checked={active} disabled={busy} onChange={e => setActive(e.target.checked)} className="h-5 w-5 shrink-0 accent-brand" />
          </label>
          {editing && pincode !== editing && <p className="text-caption text-text-secondary">Saving replaces {editing} with {pincode || 'the new pincode'}. The old pincode will no longer be served by this entry.</p>}
          <div className="flex gap-2">
            <Button type="submit" fullWidth leftIcon={editing ? <Check size={16} /> : <Plus size={16} />} isLoading={busy} disabled={loading || !validPincode || duplicate}>{editing ? 'Save changes' : 'Add area'}</Button>
            {editing && <Button type="button" variant="outline" disabled={busy} onClick={reset}>Cancel</Button>}
          </div>
        </form>
        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 text-caption leading-relaxed text-text-secondary">
          <p className="mb-1 font-semibold text-text-primary">How coverage works</p>
          <p>Only active pincodes accept pickup requests. For example, add <strong>400001</strong> with the label <strong>Fort, Mumbai</strong> to enable pickups there.</p>
          <p className="mt-2">Pause an area to stop pickups temporarily, or edit it to update its details.</p>
        </div>
      </aside>
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-sm" aria-labelledby="areas-title">
        <div className="space-y-4 border-b border-border p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2"><h2 id="areas-title" className="text-body-md font-bold text-text-primary">Pickup areas</h2><span className="text-caption text-text-tertiary">{filtered.length} of {areas.length}</span></div>
          <Input aria-label="Search pincodes or areas" placeholder="Search pincode, area or city..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={17} />} />
          <div className="flex gap-1 rounded-lg bg-background p-1" aria-label="Filter pickup areas">
            {(['all', 'active', 'paused'] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={cn('min-h-10 flex-1 rounded-md px-2 text-caption font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand', filter === value ? 'bg-surface text-brand shadow-sm' : 'text-text-secondary hover:text-brand')}>
              {value === 'all' ? 'All' : value === 'active' ? 'Active' : 'Paused'} <span className="ml-1 opacity-60">{value === 'all' ? areas.length : value === 'active' ? activeCount : areas.length - activeCount}</span>
            </button>)}
          </div>
        </div>
        {loading ? <p role="status" className="p-8 text-center text-body-sm text-text-secondary">Loading pickup areas...</p> : filtered.length === 0 ? <div className="px-5 py-12 text-center"><MapPin className="mx-auto mb-3 text-text-tertiary" size={26} /><h3 className="font-semibold text-text-primary">{areas.length ? 'No matching areas' : 'No pickup areas yet'}</h3><p className="mt-2 text-body-sm text-text-secondary">{areas.length ? 'Try another search or status filter.' : 'Add your first pincode using the form to enable pickups.'}</p>{areas.length > 0 && <Button variant="ghost" onClick={() => { setSearch(''); setFilter('all') }}>Clear filters</Button>}</div> : <ul className="divide-y divide-border">
          {filtered.map(area => <li key={area.pincode} className={cn('p-4 sm:px-5 transition-colors', editing === area.pincode ? 'bg-primary-50/60' : 'hover:bg-background/60')}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="flex items-center gap-2.5"><span className="font-mono text-body-md font-bold tracking-wide text-text-primary">{area.pincode}</span><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', area.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}><span className={cn('h-1.5 w-1.5 rounded-full', area.is_active ? 'bg-emerald-500' : 'bg-amber-500')} />{area.is_active ? 'Active' : 'Paused'}</span></div><p className="mt-1 break-words text-body-sm text-text-secondary">{area.area_name || 'No area label'}</p></div>
              <div className="flex shrink-0 items-center gap-1 border-t border-border pt-2 sm:border-0 sm:pt-0">
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => edit(area)} leftIcon={<Pencil size={14} />}>Edit</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={async () => { if (await save({ ...area, is_active: !area.is_active }, 'PATCH', area.pincode)) { if (editing === area.pincode) setActive(!area.is_active) } }}>{area.is_active ? 'Pause' : 'Enable'}</Button>
                <button type="button" disabled={busy} aria-label={'Remove pincode ' + area.pincode} title="Remove area" className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg text-text-tertiary hover:bg-error-50 hover:text-error-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand sm:ml-1" onClick={async () => { if (window.confirm('Remove ' + area.pincode + '? Customers in this area will no longer be able to request pickup.')) { if (await save(area, 'DELETE')) { if (editing === area.pincode) reset() } } }}><Trash2 size={16} /></button>
              </div>
            </div>
          </li>)}
        </ul>}
      </section>
    </div>
  </div>
}
