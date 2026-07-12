// lib/kv.ts — tiny key/value abstraction used by the OTP store + rate limiter.
//
// PROD: backed by Upstash Redis over its REST API (no extra npm dependency — just
//       fetch), so it works on serverless where module memory isn't shared between
//       instances. Configure with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
// DEV : if those env vars are absent, falls back to an in-memory Map (single
//       process only) so local `npm run dev` works with zero setup.

// Accept either Upstash's own env names OR the ones Vercel's KV / Upstash
// Marketplace integration injects automatically (KV_REST_API_*). So adding
// Upstash from the Vercel dashboard works with zero config changes.
const URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

export const kvIsRemote = Boolean(URL && TOKEN)

// ── In-memory fallback (dev) ─────────────────────────────────────────────────
const mem = new Map<string, { value: string; expiresAt: number | null }>()
function memGet(key: string): string | null {
  const e = mem.get(key)
  if (!e) return null
  if (e.expiresAt !== null && Date.now() > e.expiresAt) { mem.delete(key); return null }
  return e.value
}

// ── Upstash REST: send one command as a JSON array to the base URL ───────────
async function cmd(args: (string | number)[]): Promise<any> {
  const res = await fetch(URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV error ${res.status}`)
  const json = await res.json()
  return json.result
}

export async function kvSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (kvIsRemote) { await cmd(['SET', key, value, 'EX', ttlSeconds]); return }
  mem.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function kvGet(key: string): Promise<string | null> {
  if (kvIsRemote) return (await cmd(['GET', key])) ?? null
  return memGet(key)
}

export async function kvDel(key: string): Promise<void> {
  if (kvIsRemote) { await cmd(['DEL', key]); return }
  mem.delete(key)
}

/** Atomic increment with a TTL set on first write. Returns the new count. */
export async function kvIncr(key: string, ttlSeconds: number): Promise<number> {
  if (kvIsRemote) {
    const n = Number(await cmd(['INCR', key]))
    if (n === 1) await cmd(['EXPIRE', key, ttlSeconds])
    return n
  }
  const cur = Number(memGet(key) ?? '0') + 1
  const existing = mem.get(key)
  mem.set(key, { value: String(cur), expiresAt: existing?.expiresAt ?? Date.now() + ttlSeconds * 1000 })
  return cur
}
