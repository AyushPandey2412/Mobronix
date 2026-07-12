# Component Specifications

Every spec lists anatomy, sizes, **all states**, tokens, and a11y notes. Built on shadcn/ui +
Lucide. All interactive elements: ≥44px target, visible focus (`shadow-focus`), keyboard-complete.

Legend — *token* references resolve from [`foundations.md`](./foundations.md).

---

## 1. Button

**Variants:** `primary` · `secondary` · `outline` · `ghost` · `whatsapp`.
**Sizes:** `sm` (h 36, px 12, text-sm, icon 16) · `md` (h 44, px 16, text-md, icon 20) · `lg` (h 52, px 24, text-md/lg, icon 20).
Radius `md` · weight 600 · gap 8 (icon↔label) · `transition 100ms standard` · press `scale(0.97)`.

| Variant | Default | Hover | Active | Disabled | Loading |
|---|---|---|---|---|---|
| **Primary** | `brand` bg / white | `brand-hover` + `shadow-sm` | `brand-active` | `primary-300` bg, white, no shadow | spinner left, label dim, `aria-busy`, non-interactive |
| **Secondary** | `neutral-100` bg / `text-primary` | `neutral-200` | `neutral-300` | `neutral-100` / `text-disabled` | as above |
| **Outline** | `surface` / `border-strong` / `text-primary` | `neutral-50` bg | `neutral-100` | border `neutral-200` / `text-disabled` | as above |
| **Ghost** | transparent / `brand` | `primary-50` bg | `primary-100` | `text-disabled` | as above |
| **WhatsApp** | `#25D366` / white + `MessageCircle` | `#1EBE5D` | darken | n/a | n/a |

**Rules:** one primary CTA per screen (others subordinate) · full-width on mobile for primary flow actions ·
loading disables + keeps width (no layout jump) · focus shows `shadow-focus` (error-intent destructive uses `error` colors + confirm dialog).

```tsx
<Button variant="primary" size="lg" isLoading={pending}>Get Instant Quote</Button>
<Button variant="whatsapp" size="md"><MessageCircle size={20}/> Chat on WhatsApp</Button>
```

---

## 2. Input field

Anatomy: `label` (Label, required `*` in `error-500`) → control → helper/error (body-sm).
Height 44 · px 12 · radius `sm` · `surface` bg · `border-strong` · text-primary · placeholder `text-tertiary`.
Optional leading/trailing icon (20, `text-tertiary`). Use semantic `type` (`email`/`tel`/`number`) for mobile keyboards.

| State | Border | Ring | Note |
|---|---|---|---|
| Default | `border-strong` | — | |
| Hover | `neutral-400` | — | |
| Focus | `brand` | `shadow-focus` | |
| Filled | `border-strong` | — | text-primary |
| Error | `error-500` | `shadow-focus-error` on focus | helper → error msg, `role="alert"`, `aria-describedby`, auto-focus first invalid |
| Disabled | `neutral-200` | — | `neutral-100` bg, `text-disabled`, `cursor-not-allowed` |
| Read-only | `border` | — | `surface-subtle` bg (distinct from disabled) |

Validation: **on blur**, not per keystroke · error below field, states cause + fix ("Enter a 10-digit mobile number"). Always visible label (never placeholder-only). Mobile height ≥44.

---

## 3. Select / Dropdown

shadcn `Select` (Radix). Trigger = Input styling + `ChevronDown` (20, rotates 180° on open, 200ms).
Menu: `surface-raised`, `shadow-md`, radius `lg`, 4px padding; items h 40, hover `neutral-50`, selected `primary-50` + `Check` (16, `brand`).
Keyboard: type-ahead, arrows, Esc closes, focus returns to trigger. Long lists → search input pinned top + virtualize 50+.

---

## 4. Radio Card

Large tappable card for single-select. Used for **Battery Health · Phone Condition · Storage**.
Min-h 64 · padding 16 · radius `lg` · gap 12. Layout: optional icon/visual → title (Label) + description (body-sm `text-secondary`) → trailing radio dot / `CheckCircle2`.

| State | Border | Bg | Indicator |
|---|---|---|---|
| Default | `border` | `surface` | empty ring |
| Hover | `border-strong` | `neutral-50` | ring darkens |
| Selected | `brand` (1.5px) | `brand-subtle` | `CheckCircle2` `brand` |
| Focus | `border-strong` + `shadow-focus` | — | — |
| Disabled | `neutral-200` | `neutral-50` | `text-disabled`, e.g. storage out of stock |

Group is a `radiogroup` (arrow-key nav); whole card is the label (huge touch target). Condition variants may show example thumbnail. Money impact hint allowed: "Flawless — best price" / "+ ₹2,000".

```
┌─────────────────────────────────────┐
│ [🔋]  85–94%  (Good)        ( ◉ )    │  ← selected: brand border + brand-subtle bg
│       Normal day-long battery        │
└─────────────────────────────────────┘
```

---

## 5. Upload Image component

For condition photos (front, back, screen-on, IMEI). Drag-drop zone + camera capture + previews.

**Dropzone (empty):** dashed `border-strong` 2px, radius `lg`, `surface-subtle` bg, min-h 160, centered
`Camera` (32, `text-tertiary`) + "Tap to take a photo or drag & drop" + "JPG/PNG · up to 10MB".
Mobile shows two buttons: **Take photo** (`Camera`, `capture="environment"`) · **Upload** (`ImagePlus`).

States: *dragover* → `brand` border + `brand-subtle` bg · *uploading* → thumbnail + progress bar (`brand`) + % (tabular) + cancel ·
*success* → thumbnail, `CheckCircle2` `success` overlay, filename, remove (`X`) · *error* → `error` border + message + retry.

Rules: show thumbnails in a grid (each slot labelled) · validate type/size before upload · keyboard-openable · `aria-label` per slot · reserve space (no CLS).

---

## 6. Cards

Base: `surface` bg, radius `lg`, `border`, `shadow-xs`, padding 24 (16 mobile). Hover (if interactive): `translateY(-2px)` + `shadow-sm`, 200ms.

- **Feature card** — icon chip (40, `brand-subtle` bg + `brand` icon, radius `md`) → H4 title → body-sm `text-secondary`. Benefits grid.
- **Process card** — numbered step badge (`full`, `brand` bg / white, 28) or icon → title → desc. Optional connector line on desktop.
- **Review card** — avatar (40, `full`) + name (Label) + location (caption) + `Star`×5 (`warning-400` filled / `neutral-200` empty) + verified `ShieldCheck` (`success`) → quote (body-md). `shadow-xs`.
- **Quote Summary card** — the conversion centerpiece (see §11).

---

## 7. FAQ Accordion

shadcn `Accordion` (Radix, single, collapsible). Item: full-width trigger, py 16, question (H4/Label) left + `Plus`→`Minus` (or `ChevronDown` rotate) right. Divider `border` between items.
Open: answer (body-md `text-secondary`) reveals via `accordion-down` 200ms (height token); closed `accordion-up`.
A11y: `button` with `aria-expanded`, panel `role="region"`. Honors reduced-motion.

---

## 8. Navigation bar

**Desktop (`lg+`)** — sticky top, h 64, `surface` bg, `border-bottom`, `shadow-xs` on scroll, `z-header`.
Layout: logo left · center/right nav links (body-md `text-secondary`, active `text-primary` + 2px `brand` underline) · right cluster: phone number (`Phone` 16), **WhatsApp** ghost btn, **Get Quote** primary btn.

**Mobile (`<lg`)** — h 56, logo left · primary **Get Quote** (sm) + hamburger (`Menu`, 44px target) right.
Tap → full-screen sheet (slide-in 300ms, `overlay-scrim`): nav links (h 48), phone + WhatsApp CTAs pinned bottom, `X` close top-right. Trap focus, Esc/swipe-down dismiss.
Optional **sticky bottom action bar** on Sell flow mobile: WhatsApp + primary CTA (safe-area padded).

---

## 9. Footer

`neutral-900` bg / `neutral-300` text (or light `surface` + `border-top` — pick one site-wide).
4 columns desktop → stacked mobile: **Brand** (logo + one-line trust statement + service cities) · **Sell** (links) ·
**Company** (About, How it works, Reviews, Contact) · **Support** (FAQ, Track order, WhatsApp, phone).
Bottom row: © year, Privacy, Terms; trust badges (secure payment, GST, ratings). Links `neutral-400` → white on hover.

---

## 10. Status badges

Pill, radius `full`, px 10 / py 2, caption/label weight 600, **icon + text** (never color-alone). `{intent}-50` bg · `{intent}-700` text · `{intent}-200` border.

| Status | Intent | Color | Icon |
|---|---|---|---|
| Pending | warning | amber | `Clock` |
| Inspected | info/primary | blue | `Search` |
| Pickup Scheduled | secondary/info | blue/indigo | `Truck` |
| Completed | success | green | `CheckCircle2` |
| Rejected | error | red | `XCircle` |
| Paid | success | green | `IndianRupee` |

```tsx
<StatusBadge intent="success" icon={CheckCircle2}>Completed</StatusBadge>
```

---

## 11. Quote Summary Card (signature component)

The trust + conversion moment. Elevated: `surface`, radius `xl`, `shadow-lg`, padding 24/32, max-w 480, often sticky on desktop.

Anatomy (top→bottom):
1. Device line — thumbnail + "iPhone 13 · 128GB · Blue" (H4) + edit link.
2. Condition summary — chips (battery, condition) `neutral-100`.
3. **Quote amount** — `text-display-m` `font-mono` tabular `success-700`, prefixed ₹. Sub-label "Estimated payout".
4. Trust strip — `ShieldCheck` "Price locked for 24h" · `Wallet` "Instant payment on pickup".
5. Breakdown (optional, collapsible) — base + condition adjustments (`+/− ₹`, color-coded).
6. CTAs — **Schedule Free Pickup** (primary, full-width, lg) + **WhatsApp** (secondary). Reassurance caption: "No obligation · Free doorstep pickup".

Loading → skeleton shimmer on amount. Reduced/animated count-up respects reduced-motion.

---

## Shared: Skeleton, Toast, Modal, Trust badge

- **Skeleton** — `neutral-100` base + shimmer gradient, matches final layout (no CLS). Use for quote calc, lists >1s.
- **Toast** — bottom-center mobile / top-right desktop, `surface-raised` + `shadow-md`, intent icon, auto-dismiss 4s, `aria-live="polite"` (never steals focus). Success/error/info.
- **Modal / Sheet** — `overlay-scrim` (50%), panel `surface` radius `xl` `shadow-lg`, enter scale+fade from trigger 300ms; mobile = bottom sheet, swipe-down dismiss; confirm before dismiss if unsaved. Trap focus, Esc closes, return focus to trigger.
- **Trust badge** — inline cluster: `ShieldCheck` secure · `Star` "4.9 · 12k+ sold" · `Truck` free pickup · `IndianRupee` instant pay. Reused in hero, near every CTA, footer.
