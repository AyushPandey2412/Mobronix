# Figma Variables Structure

Mirrors [`tokens/design-tokens.json`](../tokens/design-tokens.json) so Figma and code stay in lockstep.
Build with **Figma Variables** (4 collections). Sync via **Tokens Studio** plugin → exports the same JSON
→ **Style Dictionary** → `tailwind.config.ts` / CSS vars. One source, two destinations.

---

## Collections & modes

| Collection | Modes | Purpose |
|---|---|---|
| **1. Primitives** | _single_ | Raw palette + scales. Never used directly on layers. |
| **2. Semantic** | `Light` (·`Dark` future) | Role aliases → Primitives. Bind these to components. |
| **3. Typography** | `Desktop`, `Mobile` | Type styles per breakpoint. |
| **4. Layout** | `Mobile`, `Tablet`, `Desktop` | Spacing/container/columns per breakpoint. |

Rule: components reference **Semantic / Typography / Layout** only — never Primitives directly (same as code referencing `surface`, not `neutral-0`).

---

## 1. Primitives (Color · Number)

```
color/primary/50 … 950          color/neutral/0 … 950
color/secondary/50 … 900        color/brand/whatsapp · whatsapp-hover · apple-ink
color/success/50 … 900
color/warning/50 … 900          number/radius/xs sm md lg xl 2xl full
color/error/50 … 900            number/space/0 0.5 1 2 3 4 5 6 8 10 12 16 20 24 30
```
Naming uses `/` for groups so Figma nests them (Primary ▸ 600). Values = hex / px from the token JSON.

---

## 2. Semantic (mode: Light, alias → Primitives)

```
surface            → color/neutral/0
surface/subtle     → color/neutral/50
surface/raised     → color/neutral/0
background         → color/neutral/50
border             → color/neutral/200
border/strong      → color/neutral/300
text/primary       → color/neutral/900
text/secondary     → color/neutral/600
text/tertiary      → color/neutral/500
text/on-brand      → color/neutral/0
text/disabled      → color/neutral/400
brand              → color/primary/600
brand/hover        → color/primary/700
brand/active       → color/primary/800
brand/subtle       → color/primary/50
focus/ring         → rgba(26,86,219,0.40)
overlay/scrim      → rgba(15,23,42,0.50)
status/success     → color/success/600   status/success-bg → color/success/50
status/warning     → color/warning/600   status/warning-bg → color/warning/50
status/error       → color/error/600      status/error-bg   → color/error/50
status/info        → color/primary/600    status/info-bg    → color/primary/50
```
Add a **Dark** mode later by re-pointing these aliases (e.g. `surface → neutral/900`) — components don't change.

---

## 3. Typography (Text styles, modes: Desktop / Mobile)

Create **Text Styles** named `Display/XL`, `Heading/H1`, `Body/Medium`, `Label`, etc. Bind size & line-height to mode variables so one style adapts per breakpoint.

| Style | Desktop size/LH | Mobile size/LH | Weight | Tracking |
|---|---|---|---|---|
| Display/XL | 64/72 | 40/46 | 700 | −2.2% |
| Display/L | 56/64 | 36/44 | 700 | −2.2% |
| Display/M | 44/52 | 32/40 | 700 | −2% |
| Heading/H1 | 36/44 | 28/36 | 700 | −2% |
| Heading/H2 | 30/38 | 24/32 | 700 | −1.5% |
| Heading/H3 | 24/32 | 20/28 | 600 | −1% |
| Heading/H4 | 20/28 | 18/26 | 600 | −1% |
| Body/Large | 18/28 | 17/26 | 400 | 0 |
| Body/Medium | 16/24 | 16/24 | 400 | 0 |
| Body/Small | 14/20 | 14/20 | 400 | 0 |
| Caption | 12/16 | 12/16 | 500 | +1% |
| Label | 14/20 | 14/20 | 600 | +0.5% |
| Overline | 12/16 | 12/16 | 600 | +6% UPPER |

Font: **Inter** (Variable). Number font for prices/IDs: **Geist Mono** / Inter `tnum`.

---

## 4. Layout (Number, modes: Mobile / Tablet / Desktop)

| Variable | Mobile | Tablet | Desktop |
|---|---|---|---|
| `container/padding` | 16 | 24 | 32 |
| `container/max` | — | — | 1200 |
| `grid/columns` | 4 | 8 | 12 |
| `grid/gutter` | 16 | 24 | 24 |
| `section/padding-y` | 48 | 64 | 80 |

Set up a Figma **grid style** per frame: 4/8/12 columns, stretch, gutter + margin from above.

---

## Effect & Radius styles

**Effect styles** (drop shadows, ink-tinted):
`Shadow/XS XS` `Shadow/SM` `Shadow/MD` `Shadow/LG` + `Focus/Ring` (use as a 4px spread on a frame) — values from foundations §5.
**Corner radius** bound to `number/radius/*`.

---

## Component variants in Figma

Build each component as one set with variant properties matching code props:

```
Button     → variant {primary|secondary|outline|ghost|whatsapp} ✕ size {sm|md|lg} ✕ state {default|hover|active|disabled|loading}
Input      → state {default|hover|focus|filled|error|disabled|readonly}
RadioCard  → state {default|hover|selected|focus|disabled}
StatusBadge→ intent {success|warning|error|info|secondary}
```
Bind every fill/stroke/text to a **Semantic** variable and every spacing to a **Layout/space** variable. Then a token change in Tokens Studio re-themes the whole file.

---

## Token → code pipeline

```
Figma Variables ──(Tokens Studio export)──▶ tokens/design-tokens.json
        │                                            │
        │                                   (Style Dictionary build)
        ▼                                            ▼
  design hand-off                      tailwind.config.ts  +  app/globals.css (CSS vars)
```
Keep `design-tokens.json` the contract: designers edit via Tokens Studio, devs consume the build output. PR review diffs the JSON.
