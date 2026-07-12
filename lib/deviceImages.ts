/**
 * deviceImages.ts
 *
 * Product image URLs for every iPhone and MacBook model.
 *
 * Source: Apple's own CDN (store.storeimages.cdn-apple.com)
 * — Images are served as PNG/WebP via Apple's global CDN
 * — Used only for identification / informational purposes (see trademark disclaimer in footer)
 *
 * All URLs in this file were verified to return HTTP 200 (see scripts/_imgtest).
 * Apple occasionally retires old product URLs — if a card shows the fallback
 * glyph instead of a photo, re-run the verifier and update the dead entry.
 * Models Apple no longer hosts a unique shot for are mapped to the closest
 * sibling image (e.g. iPhone 13 Pro → iPhone 13).
 */

const IPHONE_IMAGES: Record<string, string> = {
  // iPhone 17 Series (Apple CDN has no 17 shots yet → reuse 16 imagery)
  "17promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha",
  "17pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=400&hei=400&fmt=png-alpha",
  "17":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=400&hei=400&fmt=png-alpha",
  "17e":        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=400&hei=400&fmt=png-alpha",
  "air":        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-pink?wid=400&hei=400&fmt=png-alpha",

  // iPhone 16 Series
  "16promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha",
  "16pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=400&hei=400&fmt=png-alpha",
  "16plus":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-teal?wid=400&hei=400&fmt=png-alpha",
  "16":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=400&hei=400&fmt=png-alpha",
  "16e":        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=400&hei=400&fmt=png-alpha",

  // iPhone 15 Series
  "15promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha",
  "15pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha",
  "15plus":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-black?wid=400&hei=400&fmt=png-alpha",
  "15":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=400&hei=400&fmt=png-alpha",

  // iPhone 14 Series
  "14promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=400&hei=400&fmt=png-alpha",
  "14pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=400&hei=400&fmt=png-alpha",
  "14plus":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-midnight?wid=400&hei=400&fmt=png-alpha",
  "14":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-midnight?wid=400&hei=400&fmt=png-alpha",

  // iPhone 13 Series (Apple retired 13 Pro shots → reuse iPhone 13)
  "13promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pink-select-2021?wid=400&hei=400&fmt=png-alpha",
  "13pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pink-select-2021?wid=400&hei=400&fmt=png-alpha",
  "13mini":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-mini-pink-select-2021?wid=400&hei=400&fmt=png-alpha",
  "13":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pink-select-2021?wid=400&hei=400&fmt=png-alpha",

  // iPhone 12 Series (Apple retired 12 Pro shots → reuse iPhone 12)
  "12promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-blue-select-2020?wid=400&hei=400&fmt=png-alpha",
  "12pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-blue-select-2020?wid=400&hei=400&fmt=png-alpha",
  "12mini":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-mini-blue-select-2020?wid=400&hei=400&fmt=png-alpha",
  "12":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-blue-select-2020?wid=400&hei=400&fmt=png-alpha",

  // iPhone 11 Series
  "11promax":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-max-midnight-green-select-2019?wid=400&hei=400&fmt=png-alpha",
  "11pro":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-midnight-green-select-2019?wid=400&hei=400&fmt=png-alpha",
  "11":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=400&hei=400&fmt=png-alpha",

  // iPhone X Series
  "xsmax":      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-xs-max-gold-select-2018?wid=400&hei=400&fmt=png-alpha",
  "xs":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-xs-gold-select-2018?wid=400&hei=400&fmt=png-alpha",
  "xr":         "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-xr-black-select-201809?wid=400&hei=400&fmt=png-alpha",
  "x":          "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-x-silver-select-2017?wid=400&hei=400&fmt=png-alpha",

  // SE Series
  "se2022":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-starlight-select-202203?wid=400&hei=400&fmt=png-alpha",
  "se2020":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-black-select-2020?wid=400&hei=400&fmt=png-alpha",
}

const MACBOOK_IMAGES: Record<string, string> = {
  // MacBook Air
  "mba-m4":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202503?wid=400&hei=400&fmt=png-alpha",
  "mba-m3":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=400&hei=400&fmt=png-alpha",
  "mba15-m3":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202306?wid=400&hei=400&fmt=png-alpha",
  "mba-m2":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=400&hei=400&fmt=png-alpha",
  "mba15-m2":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202306?wid=400&hei=400&fmt=png-alpha",
  "mba-m1":     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=400&hei=400&fmt=png-alpha",
  "mba-intel":  "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=400&hei=400&fmt=png-alpha",

  // MacBook Pro 13"
  "mbp13-m2":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=400&hei=400&fmt=png-alpha",
  "mbp13-m1":   "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=400&hei=400&fmt=png-alpha",

  // MacBook Pro 14"
  "mbp14-m4pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=400&hei=400&fmt=png-alpha",
  "mbp14-m4":    "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=400&hei=400&fmt=png-alpha",
  "mbp14-m3pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=400&hei=400&fmt=png-alpha",
  "mbp14-m3":    "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=400&hei=400&fmt=png-alpha",
  "mbp14-m2pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202301?wid=400&hei=400&fmt=png-alpha",
  "mbp14-m1pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=400&hei=400&fmt=png-alpha",

  // MacBook Pro 16"
  "mbp16-m4pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202410?wid=400&hei=400&fmt=png-alpha",
  "mbp16-m4max": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202410?wid=400&hei=400&fmt=png-alpha",
  "mbp16-m3pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=400&hei=400&fmt=png-alpha",
  "mbp16-m3max": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=400&hei=400&fmt=png-alpha",
  "mbp16-m2pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202301?wid=400&hei=400&fmt=png-alpha",
  "mbp16-m1pro": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202110?wid=400&hei=400&fmt=png-alpha",
}

// Supabase stores a UUID as `id` and a descriptive `slug` (e.g. "iphone-12-pro"),
// while the image maps above are keyed by the short local ids ("12pro"). This
// table bridges Supabase slugs (and slugified names) → image keys so product
// photos resolve no matter where the model data came from.
const SLUG_TO_KEY: Record<string, string> = {
  "iphone-se-3rd-gen": "se2022",
  "iphone-se-2nd-gen": "se2020",
  "iphone-11": "11",
  "iphone-11-pro": "11pro",
  "iphone-11-pro-max": "11promax",
  "iphone-12": "12",
  "iphone-12-mini": "12mini",
  "iphone-12-pro": "12pro",
  "iphone-12-pro-max": "12promax",
  "iphone-13": "13",
  "iphone-13-mini": "13mini",
  "iphone-13-pro": "13pro",
  "iphone-13-pro-max": "13promax",
  "iphone-14": "14",
  "iphone-14-plus": "14plus",
  "iphone-14-pro": "14pro",
  "iphone-14-pro-max": "14promax",
  "iphone-15": "15",
  "iphone-15-plus": "15plus",
  "iphone-15-pro": "15pro",
  "iphone-15-pro-max": "15promax",
  "iphone-16": "16",
  "iphone-16-plus": "16plus",
  "iphone-16-pro": "16pro",
  "iphone-16-pro-max": "16promax",
  "iphone-16e": "16e",
  "iphone-17": "17",
  "iphone-17-plus": "16plus",
  "iphone-17-pro": "17pro",
  "iphone-17-pro-max": "17promax",
  "iphone-17-air": "air",
  "iphone-air": "air",
  "iphone-x": "x",
  "iphone-xr": "xr",
  "iphone-xs": "xs",
  "iphone-xs-max": "xsmax",
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/["'()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** Pick a representative MacBook image when the exact model has no mapping
 *  (e.g. Supabase's year-based slugs like "macbook-pro-2023"). */
function macbookFallback(text: string): string {
  const t = text.toLowerCase()
  const year = Number((t.match(/20\d{2}/) || [])[0] || 0)
  if (t.includes("air")) {
    if (year >= 2024) return "mba-m4"
    if (year >= 2022) return "mba-m2"
    return "mba-m1"
  }
  if (t.includes("pro")) {
    if (year === 0 || year >= 2021) return "mbp14-m3"
    return "mbp13-m2"
  }
  return "mba-m1"
}

export interface DeviceImageRef {
  id?: string
  slug?: string | null
  name?: string
  category?: string
}

/**
 * Returns the product image URL for a model. Accepts either a model-like object
 * ({ id, slug, name, category }) or a plain id string (back-compat).
 * Resolves via id → slug → slugified name. Returns null if nothing matches
 * (the component then falls back to an SVG glyph).
 */
export function getDeviceImage(
  ref: string | DeviceImageRef,
  category?: string
): string | null {
  const model: DeviceImageRef = typeof ref === "string" ? { id: ref, category } : ref
  const cat = model.category ?? category

  // Build candidate identifiers, most specific first.
  const candidates: string[] = []
  for (const v of [model.id, model.slug, model.name]) {
    if (!v) continue
    candidates.push(String(v).toLowerCase())
    candidates.push(slugify(String(v)))
  }

  const isMac =
    cat === "macbook" ||
    candidates.some((c) => c.startsWith("mb") || c.includes("macbook"))

  const TABLE = isMac ? MACBOOK_IMAGES : IPHONE_IMAGES

  for (const c of candidates) {
    if (TABLE[c]) return TABLE[c] // direct key (local short ids)
    const mapped = SLUG_TO_KEY[c]
    if (mapped && TABLE[mapped]) return TABLE[mapped] // supabase slug / slugified name
  }

  if (isMac) return MACBOOK_IMAGES[macbookFallback(candidates.join(" "))] ?? null
  return null
}

/**
 * Same as getDeviceImage but with Apple's CDN `wid`/`hei` params set to `px`,
 * so the image can be loaded DIRECTLY from Apple's CDN at the exact size we
 * display it (use with next/image `unoptimized`). This skips Next's on-demand
 * image optimizer — which has a ~0.5s cold-start per image — so device grids
 * fill in instantly. Same picture, just fetched pre-sized from Apple.
 */
export function getDeviceImageSized(
  ref: string | DeviceImageRef,
  px: number,
  category?: string
): string | null {
  const url = getDeviceImage(ref, category)
  if (!url) return null
  return url
    .replace(/([?&])wid=\d+/i, `$1wid=${px}`)
    .replace(/([?&])hei=\d+/i, `$1hei=${px}`)
}
