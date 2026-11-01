'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { StarRow } from '@/components/ui/Stars'
import { Card } from '@/components/ui/Card'
import { REVIEWS } from '@/lib/data'

type Review = { id: string; name: string; device: string; rating: number; review_text: string }
export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/reviews', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) return
        const data = await response.json()
        if (!controller.signal.aborted) setReviews(data.reviews || [])
      } catch { /* Keep existing testimonials available if the request fails. */ }
    }
    void load()
    const refresh = () => { if (document.visibilityState === 'visible') void load() }
    document.addEventListener('visibilitychange', refresh)
    return () => { controller.abort(); document.removeEventListener('visibilitychange', refresh) }
  }, [])
  const displayed = reviews.length ? reviews : REVIEWS.map((review, index) => ({ id: `static-${index}`, name: review.name, device: review.city, rating: review.rating, review_text: review.text || review.review_text || '' }))
  return <section className="container-app py-10 md:py-20">
    <SectionHeading eyebrow="Customer reviews" title="What sellers say" center />
    <div className="mt-6 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-4">
      {displayed.map(review => <Card key={review.id} padded className="h-full">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-body-md font-bold text-text-primary">{review.name}</p><StarRow value={review.rating} /></div>
        <p className="mt-1 text-caption text-text-tertiary">{review.device}</p>
        <p className="mt-3 whitespace-pre-wrap break-words text-body-sm leading-relaxed text-text-secondary">&quot;{review.review_text}&quot;</p>
        {reviews.length > 0 && <p className="mt-4 flex items-center gap-1.5 text-caption font-medium text-brand"><BadgeCheck size={15} />Verified customer</p>}
      </Card>)}
    </div>
  </section>
}
