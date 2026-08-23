import type { EnquiryStatus } from './types'

export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'price_confirmed',
  'pickup_scheduled',
  'payment_completed',
  'completed',
  'cancelled',
] as const satisfies readonly EnquiryStatus[]

export const ACTIVE_ENQUIRY_STATUSES: EnquiryStatus[] = [
  'new',
  'contacted',
  'price_confirmed',
  'pickup_scheduled',
  'payment_completed',
]

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  pickup_scheduled: 'Pickup',
  price_confirmed: 'Price Confirmed',
  payment_completed: 'Paid',
  completed: 'Done',
  cancelled: 'Cancelled',
}

export const ENQUIRY_STATUS_STEPS: Record<EnquiryStatus, number> = {
  new: 0,
  contacted: 1,
  price_confirmed: 2,
  pickup_scheduled: 3,
  payment_completed: 4,
  completed: 5,
  cancelled: 6,
}

export const TRACKING_STEPS = [
  'New',
  'Contacted',
  'Price Confirmed',
  'Pickup',
  'Paid',
  'Done',
  'Cancelled',
] as const

export function statusLabel(status: EnquiryStatus) {
  return ENQUIRY_STATUS_LABELS[status] ?? status
}

export function normalizeLegacyStatus(status: string | null | undefined): EnquiryStatus {
  switch (status) {
    case 'pending':
      return 'new'
    case 'accepted':
      return 'contacted'
    case 'inspection':
      return 'price_confirmed'
    case 'rejected':
      return 'cancelled'
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'cancelled'
    default:
      return (ENQUIRY_STATUSES as readonly string[]).includes(status ?? '')
        ? (status as EnquiryStatus)
        : 'new'
  }
}
