import type { WhatsAppConfig, WhatsAppSendResult, WhatsAppTemplatePayload } from './types'
import { assertWhatsAppConfig, getWhatsAppConfig } from './utils'

export class WhatsAppClient {
  constructor(private readonly config: WhatsAppConfig = getWhatsAppConfig()) {}

  async sendMessage(payload: WhatsAppTemplatePayload): Promise<WhatsAppSendResult> {
    try {
      assertWhatsAppConfig(this.config)
      const res = await fetch(
        `https://graph.facebook.com/${this.config.graphApiVersion}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        return {
          ok: false,
          statusCode: res.status,
          error: body?.error?.message ?? `WhatsApp API request failed with ${res.status}`,
          payload: body,
        }
      }
      return {
        ok: true,
        messageId: body?.messages?.[0]?.id,
        statusCode: res.status,
        payload: body,
      }
    } catch (error: any) {
      return { ok: false, error: error?.message ?? 'WhatsApp send failed' }
    }
  }
}

export const whatsappClient = new WhatsAppClient()
