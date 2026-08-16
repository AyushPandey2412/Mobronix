import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const publicDir = path.join(root, "public", "devices")
const manifestPath = path.join(root, "lib", "generated", "deviceImageManifest.ts")
const dataPath = path.join(root, "lib", "data.ts")
const apiBase = "https://api.mobileapi.dev"
let lastApiRequestAt = 0

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadLocalEnv() {
  try {
    const envText = await readFile(path.join(root, ".env.local"), "utf8")
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
      const [name, ...rest] = trimmed.split("=")
      if (!process.env[name]) process.env[name] = rest.join("=").replace(/^["']|["']$/g, "")
    }
  } catch {
    // .env.local is optional; CI can provide MOBILEAPI_API_KEY directly.
  }
}

await loadLocalEnv()
const key = process.env.MOBILEAPI_API_KEY || process.env.MOBILEAPI_KEY

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/["'()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function extractModels(source) {
  const models = []
  const re =
    /^\s*\{\s*id:\s*"((?:\\.|[^"])*)"\s*,\s*name:\s*"((?:\\.|[^"])*)".*?category:\s*"((?:\\.|[^"])*)"/gm
  for (const match of source.matchAll(re)) {
    const [, id, rawName, category] = match
    const name = rawName.replace(/\\"/g, '"')
    models.push({ id, name, category, slug: slugify(name) })
  }
  return models
}

async function existingManifest() {
  const map = {}
  try {
    const files = await readdir(publicDir)
    for (const file of files) {
      if (!/\.(png|jpe?g|webp)$/i.test(file)) continue
      map[path.basename(file, path.extname(file))] = `/devices/${file}`
    }
  } catch {
    // Directory may not exist on first run.
  }
  return map
}

function attachManifestEntry(map, model, url) {
  map[model.slug] = url
  map[model.id] = url
}

function pickArray(payload) {
  if (Array.isArray(payload)) return payload
  for (const key of ["results", "devices", "data", "items"]) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return payload ? [payload] : []
}

function imageFromObject(value) {
  if (!value || typeof value !== "object") return null
  for (const key of [
    "image_url",
    "main_image_url",
    "thumbnail_url",
    "thumbnail",
    "image",
    "main_image",
    "picture",
  ]) {
    if (typeof value[key] === "string" && /^https?:\/\//i.test(value[key])) return value[key]
  }
  for (const key of ["image_b64", "main_image_b64"]) {
    if (typeof value[key] === "string" && value[key].length > 100) {
      return { base64: value[key] }
    }
  }
  if (Array.isArray(value.images)) {
    for (const image of value.images) {
      const picked = imageFromObject(image)
      if (picked) return picked
    }
  }
  return null
}

function scoreImageEntry(entry) {
  const type = String(entry?.type || "").toLowerCase()
  let score = 0
  if (entry?.is_official) score += 20
  if (type === "main") score += 100
  else if (type === "gallery") score += 70
  else if (type === "thumbnail") score -= 100
  if (/thumb/i.test(String(entry?.image_url || ""))) score -= 100
  return score
}

async function mobileApi(pathname, params, attempt = 0) {
  const apiDelayMs = Number(process.env.MOBILEAPI_DELAY_MS || 3500)
  const maxRateLimitRetries = Number(process.env.MOBILEAPI_MAX_429_RETRIES || 12)
  const fallbackRetryAfterSeconds = Number(process.env.MOBILEAPI_RETRY_AFTER_SECONDS || 60)
  const waitMs = Math.max(0, apiDelayMs - (Date.now() - lastApiRequestAt))
  if (waitMs > 0) await sleep(waitMs)
  lastApiRequestAt = Date.now()
  const url = new URL(pathname, apiBase)
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Token ${key}`,
    },
  })
  if (res.status === 429) {
    if (attempt >= maxRateLimitRetries) throw new Error(`${res.status} ${res.statusText}`)
    const retryAfter = Number(res.headers.get("retry-after") || fallbackRetryAfterSeconds)
    console.warn(
      `MobileAPI rate limit hit. Waiting ${retryAfter}s before retry ${attempt + 1}/${maxRateLimitRetries}.`
    )
    await sleep(retryAfter * 1000)
    return mobileApi(pathname, params, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function getImageSource(model) {
  let payload = await mobileApi("/devices/search/", {
    name: model.name,
    manufacturer: "Apple",
    exact: "true",
    page: "1",
  })
  let devices = pickArray(payload)
  if (devices.length === 0) {
    payload = await mobileApi("/devices/search/", {
      name: model.name,
      manufacturer: "Apple",
      page: "1",
    })
    devices = pickArray(payload)
  }
  const best =
    devices.find((item) => slugify(item.name || item.device_name || "") === model.slug) ||
    devices[0]
  const id = best?.id || best?.device_id
  if (id) {
    const imagesPayload = await mobileApi(`/devices/${id}/images/`, { limit: "10" })
    const imageEntries = pickArray(imagesPayload)
      .filter((item) => String(item?.type || "").toLowerCase() !== "thumbnail")
      .sort((a, b) => scoreImageEntry(b) - scoreImageEntry(a))
    for (const item of imageEntries) {
      const image = imageFromObject(item)
      if (image) return image
    }
  }

  const direct = imageFromObject(best)
  if (typeof direct === "string" && /thumb/i.test(direct)) return null
  return direct
}

async function saveImage(model, source) {
  await mkdir(publicDir, { recursive: true })
  if (typeof source === "object" && source.base64) {
    const file = `${model.slug}.png`
    const target = path.join(publicDir, file)
    const base64 = source.base64.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "")
    await writeFile(target, Buffer.from(base64, "base64"))
    return `/devices/${file}`
  }
  const res = await fetch(source)
  if (!res.ok) throw new Error(`image ${res.status} ${res.statusText}`)
  const contentType = res.headers.get("content-type") || ""
  const ext = contentType.includes("webp")
    ? "webp"
    : contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : "png"
  const file = `${model.slug}.${ext}`
  const target = path.join(publicDir, file)
  await writeFile(target, Buffer.from(await res.arrayBuffer()))
  return `/devices/${file}`
}

async function writeManifest(map) {
  const body = `// Generated by \`npm run cache:device-images\`.
// Keep committed so production serves cached images without calling MobileAPI.
export const LOCAL_DEVICE_IMAGES: Record<string, string> = ${JSON.stringify(map, null, 2)}
`
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, body)
}

async function getCachedImageMeta(url) {
  try {
    const sharp = await import("sharp")
    const file = path.join(root, "public", url.replace(/^\/+/, ""))
    return sharp.default(file).metadata()
  } catch {
    return null
  }
}

async function shouldRefreshCached(model, manifest) {
  if (process.env.MOBILEAPI_REFRESH_EXISTING === "1") return true
  const url = manifest[model.slug] || manifest[model.id]
  if (!url) return false
  const meta = await getCachedImageMeta(url)
  if (!meta) return true
  return (meta.width || 0) < 300 || (meta.height || 0) < 300
}

async function cacheModelImage(model, manifest) {
  const image = await getImageSource(model)
  if (!image) {
    console.warn(`No image found: ${model.name}`)
    return false
  }
  attachManifestEntry(manifest, model, await saveImage(model, image))
  await writeManifest(manifest)
  console.log(`Cached ${model.name} -> ${manifest[model.slug]}`)
  return true
}

const source = await readFile(dataPath, "utf8")
const allowedCategories = (process.env.MOBILEAPI_CATEGORIES || "iphone,macbook")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
const onlyModels = (process.env.MOBILEAPI_ONLY || "")
  .split(",")
  .map((value) => slugify(value.trim()))
  .filter(Boolean)
const models = extractModels(source).filter((model) => {
  if (!allowedCategories.includes(model.category)) return false
  if (onlyModels.length > 0) return onlyModels.includes(model.slug) || onlyModels.includes(model.id)
  return true
})
const manifest = await existingManifest()

for (const model of models) {
  const existing = manifest[model.slug] || manifest[model.id]
  if (existing) attachManifestEntry(manifest, model, existing)
}

if (!key) {
  await writeManifest(manifest)
  console.log("MOBILEAPI_API_KEY is missing. Wrote manifest for existing local images only.")
  process.exit(0)
}

if (process.env.MOBILEAPI_SKIP_FETCH === "1") {
  await writeManifest(manifest)
  console.log(`Wrote manifest for existing local images only. Total local ${Object.keys(manifest).length}.`)
  process.exit(0)
}

let downloaded = 0
for (const model of models) {
  try {
    if (manifest[model.slug] || manifest[model.id]) {
      if (!(await shouldRefreshCached(model, manifest))) continue
    }
    if (await cacheModelImage(model, manifest)) downloaded += 1
  } catch (error) {
    console.warn(`Skipped ${model.name}: ${error.message}`)
  }
}

await writeManifest(manifest)
console.log(`Device image cache complete. Downloaded ${downloaded}, total local ${Object.keys(manifest).length}.`)
