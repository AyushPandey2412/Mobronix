export type WhatsAppRecipientType = 'owner' | 'customer'

export type WhatsAppTemplateName =
  | 'owner_new_enquiry'
  | 'customer_status_update'

export interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  verifyToken: string
  appSecret: string
  graphApiVersion: string
}

export interface WhatsAppTextParameter {
  type: 'text'
  text: string
}

export interface WhatsAppTemplateComponent {
  type: 'body'
  parameters: WhatsAppTextParameter[]
}

export interface WhatsAppTemplatePayload {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'template'
  template: {
    name: WhatsAppTemplateName
    language: { code: string }
    components: WhatsAppTemplateComponent[]
  }
}

export interface WhatsAppSendResult {
  ok: boolean
  messageId?: string
  error?: string
  statusCode?: number
  payload?: unknown
}
