'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Stars } from '@/components/ui/Stars'
import { Modal } from '@/components/ui/Modal'

export function OrderReview({ enquiryId }: { enquiryId: string }) {
  const [eligible, setEligible] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setEligible(false); setReviewed(false)
    fetch(`/api/reviews?enquiry_id=${encodeURIComponent(enquiryId)}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data })
      .then(data => { if (!controller.signal.aborted) { setEligible(data.eligible); setReviewed(!!data.review) } })
      .catch(e => { if (!controller.signal.aborted) setError(e.message || 'Could not load reviews.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [enquiryId, attempt])

  if (loading) return <p className="border-t border-border p-4 text-caption text-text-tertiary">Checking review availability...</p>
  if (error && !eligible) return <div className="border-t border-border p-4 text-body-sm"><p role="alert" className="text-error-600">{error}</p><Button size="sm" variant="ghost" onClick={() => setAttempt(value => value + 1)}>Retry</Button></div>
  if (!eligible && !reviewed) return null
  return <div className="border-t border-border bg-primary-50/40 p-4">
    {reviewed ? <div role="status" className="flex items-center gap-2 text-body-sm font-medium text-brand"><CheckCircle2 size={18} />Thank you! You’ve reviewed this order.</div> : <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-body-sm font-bold text-text-primary">How was your experience?</p><p className="mt-1 text-caption text-text-secondary">Tell us about your pickup and payment.</p></div><Button size="sm" variant="outline" leftIcon={<MessageSquare size={15} />} onClick={() => setOpen(true)}>Give a review</Button></div>}
    <Modal open={open} onClose={() => { if (!busy) setOpen(false) }} title="Review your experience">
      <form className="space-y-5" onSubmit={async event => {
        event.preventDefault(); setBusy(true); setError('')
        try {
          const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enquiry_id: enquiryId, rating, review_text: text.trim() }) })
          const data = await response.json()
          if (response.status === 409) { setReviewed(true); setOpen(false); return }
          if (!response.ok) throw new Error(data.error)
          setReviewed(true); setOpen(false)
        } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') }
        finally { setBusy(false) }
      }}>
        <p className="text-body-sm text-text-secondary">How did we do? Share your honest feedback.</p>
        <fieldset disabled={busy} className="space-y-2"><legend className="mb-2 text-label text-text-primary">Your rating</legend><Stars value={rating} onRate={setRating} /><p className="text-caption text-text-tertiary">{rating ? `${rating} out of 5 stars` : 'Choose 1 to 5 stars'}</p></fieldset>
        <Textarea label="Your review" required minLength={10} maxLength={1000} disabled={busy} value={text} onChange={event => setText(event.target.value)} placeholder="How was the pickup, communication and payment?" hint={`${text.trim().length}/1,000 characters · Minimum 10 characters`} />
        <p className="text-caption leading-relaxed text-text-secondary">By submitting, you agree that your first name, device, rating and review may appear on our website after approval. Please don’t include your phone number, address or other private details.</p>
        {error && <p role="alert" className="text-body-sm text-error-600">{error}</p>}
        <Button fullWidth type="submit" isLoading={busy} disabled={!rating || text.trim().length < 10}>Submit review</Button>
      </form>
    </Modal>
  </div>
}
