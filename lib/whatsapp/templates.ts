import { inr } from '@/lib/format'
import { statusLabel } from '@/lib/enquiryStatus'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import type { WhatsAppTemplatePayload } from './types'

const LANGUAGE_CODE = 'en'

function firstDeviceLabel(enquiry: Enquiry) {
  const devices = (enquiry.devices ?? []) as any[]
  const first = devices[0]
  if (!first) return 'Device'
  const label = [first.model, first.variant, first.chip, first.storage].filter(Boolean).join(' ')
  return devices.length > 1 ? `${label} +${devices.length - 1} more` : label
}

function customerName(enquiry: Enquiry) {
  return enquiry.profile?.full_name || enquiry.guest_name || 'Customer'
}

export function ownerNewEnquiryTemplate(enquiry: Enquiry, ownerPhone: string): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: ownerPhone,
    type: 'template',
    template: {
      name: 'owner_new_enquiry',
      language: { code: LANGUAGE_CODE },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: enquiry.display_id ?? enquiry.id },
          { type: 'text', text: customerName(enquiry) },
          { type: 'text', text: enquiry.guest_phone || enquiry.profile?.phone || 'Not provided' },
          { type: 'text', text: firstDeviceLabel(enquiry) },
          { type: 'text', text: inr(enquiry.total_amount ?? 0) },
          { type: 'text', text: enquiry.pickup_slot ?? 'Not selected' },
        ],
      }],
    },
  }
}

export function customerStatusTemplate(
  enquiry: Enquiry,
  customerPhone: string,
  status: EnquiryStatus
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: customerPhone,
    type: 'template',
    template: {
      name: 'customer_status_update',
      language: { code: LANGUAGE_CODE },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: customerName(enquiry).split(' ')[0] || 'there' },
          { type: 'text', text: enquiry.display_id ?? enquiry.id },
          { type: 'text', text: statusLabel(status) },
          { type: 'text', text: firstDeviceLabel(enquiry) },
          { type: 'text', text: inr(enquiry.total_amount ?? 0) },
        ],
      }],
    },
  }
}
