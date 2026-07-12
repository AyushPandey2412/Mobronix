import type { EnquiryStatus } from './types'

export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'pickup_scheduled',
  'inspection',
  'price_confirmed',
  'payment_completed',
  'completed',
  'cancelled',
] as const satisfies readonly EnquiryStatus[]

export const ACTIVE_ENQUIRY_STATUSES: EnquiryStatus[] = [
  'new',
  'contacted',
  'pickup_scheduled',
  'inspection',
  'price_confirmed',
  'payment_completed',
]

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  pickup_scheduled: 'Pickup Scheduled',
  inspection: 'Inspection',
  price_confirmed: 'Price Confirmed',
  payment_completed: 'Payment Completed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ENQUIRY_STATUS_STEPS: Record<EnquiryStatus, number> = {
  new: 0,
  contacted: 1,
  pickup_scheduled: 2,
  inspection: 3,
  price_confirmed: 4,
  payment_completed: 5,
  completed: 6,
  cancelled: 7,
}

export const TRACKING_STEPS = [
  'New',
  'Contacted',
  'Pickup Scheduled',
  'Inspection',
  'Price Confirmed',
  'Payment Completed',
  'Completed',
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
