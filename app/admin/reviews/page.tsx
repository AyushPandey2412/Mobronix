'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, MessageSquare, BadgeCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StarRow } from '@/components/ui/Stars'
import { cn } from '@/lib/utils'

type Review = { id: string; enquiry_id: string | null; name: string; device: string; rating: number; review_text: string; status: 'pending' | 'published' | 'hidden'; created_at: string; enquiries: { display_id: string } | null }
type Filter = 'all' | Review['status']

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    const response = await fetch('/api/admin/reviews', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    setReviews(data.reviews)
  }, [])
  useEffect(() => { load().catch(e => setError(e.message)).finally(() => setLoading(false)) }, [load])
  async function update(review: Review, status: 'published' | 'hidden' | 'deleted') {
    if (status === 'deleted' && !window.confirm('Permanently delete this review? This removes it from the database and website and cannot be undone.')) return
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: review.id, status }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      await load()
      setNotice(status === 'published' ? 'Review published on the website.' : status === 'hidden' ? 'Review hidden from the website.' : 'Review deleted.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') }
    finally { setBusy(false) }
  }
  const filtered = reviews.filter(review => (filter === 'all' || review.status === filter) && [review.name, review.device, review.review_text, review.enquiries?.display_id].join(' ').toLowerCase().includes(search.toLowerCase().trim()))
  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-caption font-semibold uppercase tracking-wider text-brand">Customer feedback</p><h1 className="mt-1 text-h3 font-bold text-text-primary">Reviews</h1><p className="mt-2 text-body-sm text-text-secondary">Publish verified customer feedback on your homepage. Customer wording stays unchanged.</p></div><Button size="sm" variant="outline" disabled={loading || busy} leftIcon={<RefreshCw size={15} />} onClick={async () => { setLoading(true); setError(''); try { await load() } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') } finally { setLoading(false) } }}>Refresh</Button></header>
    {error && <p role="alert" className="rounded-lg bg-error-50 p-3 text-body-sm text-error-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-primary-50 p-3 text-body-sm text-brand">{notice}</p>}
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <Input aria-label="Search customer reviews" leftIcon={<Search size={17} />} placeholder="Search name, device, review or enquiry..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['pending', 'published', 'hidden', 'all'] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={cn('min-h-11 rounded-lg px-3 text-body-sm font-semibold capitalize', filter === value ? 'bg-primary-50 text-brand' : 'bg-background text-text-secondary')}>
        {value} <span className="ml-1 opacity-60">{value === 'all' ? reviews.length : reviews.filter(review => review.status === value).length}</span>
      </button>)}</div>
    </div>
    {loading ? <p role="status" className="p-8 text-center text-text-secondary">Loading reviews...</p> : filtered.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center"><MessageSquare className="mx-auto mb-3 text-brand" /><h2 className="font-semibold text-text-primary">No {filter === 'all' ? '' : filter + ' '}reviews</h2><p className="mt-2 text-body-sm text-text-secondary">Customers can leave a review from Track Order after their order is completed.</p></div> : <div className="grid gap-4 md:grid-cols-2">{filtered.map(review => <article key={review.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-text-primary">{review.name}</p><span className={cn('rounded-full px-2 py-1 text-caption font-semibold capitalize', review.status === 'published' ? 'bg-emerald-50 text-emerald-700' : review.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-text-secondary')}>{review.status}</span></div>
      <div className="mt-2"><StarRow value={review.rating} /></div>
      <p className="mt-3 flex items-center gap-1 text-caption text-brand"><BadgeCheck size={14} />Verified customer · {review.device}</p>
      <p className="my-4 flex-1 whitespace-pre-wrap break-words text-body-sm leading-relaxed text-text-secondary">{review.review_text}</p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-caption text-text-tertiary">{review.enquiry_id ? <Link className="text-brand hover:underline" href={`/admin/orders/${review.enquiry_id}`}>{review.enquiries?.display_id || 'View order'}</Link> : <span>Order removed</span>}<time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })}</time></div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">{review.status !== 'published' && <Button size="sm" disabled={busy} onClick={() => update(review, 'published')}>Publish on website</Button>}{review.status !== 'hidden' && <Button size="sm" variant="outline" disabled={busy} onClick={() => update(review, 'hidden')}>Hide</Button>}<Button size="sm" variant="ghost" className="text-error-600" disabled={busy} onClick={() => update(review, 'deleted')}>Delete</Button></div>
    </article>)}</div>}
  </div>
}
