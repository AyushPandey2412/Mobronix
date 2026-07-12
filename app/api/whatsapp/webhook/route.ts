import { NextResponse } from 'next/server'
import { getWhatsAppConfig, verifyWebhookSignature } from '@/lib/whatsapp/utils'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  const config = getWhatsAppConfig()

  if (mode === 'subscribe' && token && token === config.verifyToken && challenge) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: Request) {
  const config = getWhatsAppConfig()
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifyWebhookSignature(rawBody, signature, config.appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.info('[whatsapp:webhook] received', JSON.stringify(summarizeWebhook(body)))
  return NextResponse.json({ ok: true })
}

function summarizeWebhook(body: unknown) {
  const entries = Array.isArray((body as any)?.entry) ? (body as any).entry : []
  return {
    object: (body as any)?.object ?? null,
    entries: entries.map((entry: any) => ({
      id: entry?.id ?? null,
      changes: Array.isArray(entry?.changes)
        ? entry.changes.map((change: any) => ({
            field: change?.field ?? null,
            statuses: Array.isArray(change?.value?.statuses)
              ? change.value.statuses.map((status: any) => ({
                  id: status?.id ?? null,
                  status: status?.status ?? null,
                  timestamp: status?.timestamp ?? null,
                  recipient_id: status?.recipient_id ?? null,
                }))
              : [],
            messages: Array.isArray(change?.value?.messages)
              ? change.value.messages.map((message: any) => ({
                  id: message?.id ?? null,
                  from: message?.from ?? null,
                  type: message?.type ?? null,
                  timestamp: message?.timestamp ?? null,
                }))
              : [],
          }))
        : [],
    })),
  }
}
