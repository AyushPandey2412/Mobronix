import type { SupabaseClient } from '@supabase/supabase-js'
import { ownerNewEnquiryTemplate, customerStatusTemplate } from './templates'
import { normalizePhoneNumber } from './utils'
import { whatsappClient, WhatsAppClient } from './client'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import type { WhatsAppRecipientType, WhatsAppSendResult } from './types'

type NotificationStatus = 'sent' | 'failed' | 'skipped'

interface NotificationInput {
  supabase: SupabaseClient
  enquiry: Enquiry
  recipientType: WhatsAppRecipientType
  eventKey: string
  toPhone: string
  templateName: 'owner_new_enquiry' | 'customer_status_update'
  send: () => Promise<WhatsAppSendResult>
}

async function saveNotification(
  supabase: SupabaseClient,
  input: Omit<NotificationInput, 'supabase' | 'send'>,
  status: NotificationStatus,
  result: WhatsAppSendResult
) {
  const { error } = await supabase.from('whatsapp_notifications').upsert({
    enquiry_id: input.enquiry.id,
    recipient_type: input.recipientType,
    event_key: input.eventKey,
    to_phone: input.toPhone,
    template_name: input.templateName,
    whatsapp_message_id: result.messageId ?? null,
    status,
    error_message: result.error ?? null,
    response_payload: result.payload ?? null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  }, {
    onConflict: 'enquiry_id,recipient_type,event_key',
  })
  if (error) console.error('[whatsapp] notification audit failed', error)
}

async function sendOnce(input: NotificationInput) {
  const existing = await input.supabase
    .from('whatsapp_notifications')
    .select('id, status')
    .eq('enquiry_id', input.enquiry.id)
    .eq('recipient_type', input.recipientType)
    .eq('event_key', input.eventKey)
    .eq('status', 'sent')
    .maybeSingle()

  if (existing.data) {
    return { ok: true, skipped: true as const }
  }

  const result = await input.send()
  await saveNotification(input.supabase, input, result.ok ? 'sent' : 'failed', result)
  return { ok: result.ok, skipped: false as const, error: result.error }
}

export class WhatsAppNotificationService {
  constructor(private readonly client: WhatsAppClient = whatsappClient) {}

  async notifyOwner(supabase: SupabaseClient, enquiry: Enquiry) {
    const ownerPhone = normalizePhoneNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '')
    if (!ownerPhone) {
      console.error('[whatsapp] owner notification skipped: NEXT_PUBLIC_WHATSAPP_NUMBER is missing')
      return { ok: false, error: 'Owner WhatsApp number is missing' }
    }
    const payload = ownerNewEnquiryTemplate(enquiry, ownerPhone)
    return sendOnce({
      supabase,
      enquiry,
      recipientType: 'owner',
      eventKey: 'owner:new_enquiry',
      toPhone: ownerPhone,
      templateName: 'owner_new_enquiry',
      send: () => this.client.sendMessage(payload),
    })
  }

  async notifyCustomer(supabase: SupabaseClient, enquiry: Enquiry, status: EnquiryStatus) {
    const rawPhone = enquiry.profile?.phone || enquiry.guest_phone || ''
    const customerPhone = normalizePhoneNumber(rawPhone)
    if (!customerPhone) {
      console.error('[whatsapp] customer notification skipped: customer phone is missing', enquiry.id)
      return { ok: false, error: 'Customer WhatsApp number is missing' }
    }
    const payload = customerStatusTemplate(enquiry, customerPhone, status)
    return sendOnce({
      supabase,
      enquiry,
      recipientType: 'customer',
      eventKey: `customer:status:${status}`,
      toPhone: customerPhone,
      templateName: 'customer_status_update',
      send: () => this.client.sendMessage(payload),
    })
  }
}

export const whatsappNotificationService = new WhatsAppNotificationService()
