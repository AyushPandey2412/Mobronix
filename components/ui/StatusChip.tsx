import { clsx } from '@/lib/clsx'
import { normalizeLegacyStatus, statusLabel } from '@/lib/enquiryStatus'
import type { EnquiryStatus } from '@/lib/types'
export default function StatusChip({ status, trackingStep }: { status: EnquiryStatus; trackingStep?: number }) {
  const normalized = normalizeLegacyStatus(status)
  let label = statusLabel(normalized)
  let cls = 'bg-info-soft text-info'
  if (normalized === 'completed' || normalized === 'payment_completed') cls = 'bg-accent-soft text-accent-deep'
  else if (normalized === 'cancelled') cls = 'bg-line text-ink-soft'
  else if (normalized === 'inspection' || normalized === 'price_confirmed' || trackingStep === 4) cls = 'bg-amber-50 text-gold'
  return <span className={clsx('inline-block rounded-full px-3 py-1 text-xs font-semibold', cls)}>{label}</span>
}
