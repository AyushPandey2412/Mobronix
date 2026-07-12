import crypto from 'crypto'
import type { WhatsAppConfig } from './types'

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
    appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
    graphApiVersion: 'v23.0',
  }
}

export function assertWhatsAppConfig(config = getWhatsAppConfig()) {
  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'graphApiVersion' && !value)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`Missing WhatsApp configuration: ${missing.join(', ')}`)
  }
}

export function normalizePhoneNumber(phone: string, defaultCountryCode = '91') {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `${defaultCountryCode}${digits}`
  return digits
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature || !signature.startsWith('sha256=') || !appSecret) return false
  const expected = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')
  const received = signature.slice('sha256='.length)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}
