import { z } from 'zod'

export const customerReviewSchema = z.object({
  enquiry_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().min(10).max(1000),
})

export function reviewEligibility(order: { user_id: string | null; status: string }, userId: string) {
  return order.user_id === userId && order.status === 'completed'
}

export function publicReviewName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0]?.slice(0, 60) || 'Customer'
}
