# Page Systems, Forms & Flows

How sections compose into pages, the sell-flow architecture, and reusable form patterns.
All layouts mobile-first; sections use `.section-y` rhythm and `.container-app` (max 1200).

---

## HOME PAGE

Single scannable narrative: *trust → quote → reassure → convert.* One primary action repeated: **Get Instant Quote**.

| # | Section | Pattern |
|---|---|---|
| 1 | **Hero** | Left: Overline → Display XL/L headline ("Sell your iPhone. Get paid instantly.") → body-lg sub → **Model Selector** (search + popular chips) as primary CTA → trust strip (`ShieldCheck`, `Star 4.9`, `Truck`). Right: iPhone visual / quote card preview. Mobile: stacked, headline → selector → trust. `bg-brand-gradient` only as subtle accent, not full bleed. |
| 2 | **Model Selector** | Search input (`Search` icon, autocomplete) + grid of popular models (radio cards w/ thumbnail). Selecting → `/sell/device`. Can be hero-embedded + repeated mid-page. |
| 3 | **How It Works** | 4 Process cards w/ connector line (desktop): Select model → Get quote → Free pickup → Instant payment. Icons `Smartphone`/`Wallet`/`Truck`/`IndianRupee`. |
| 4 | **Benefits** | 3–6 Feature cards: Best price, Instant UPI/bank payment, Free doorstep pickup, 100% safe & data-wiped, No haggling, Same-day in Mumbai. |
| 5 | **Reviews** | Review cards carousel/grid + aggregate "4.9 ★ · 12,000+ iPhones bought". Verified badges. |
| 6 | **FAQ** | Accordion, 6–10 Qs (payment timing, data safety, price lock, pickup areas). |
| 7 | **CTA Banner** | `bg-brand-gradient`, radius `xl`, white headline + Model Selector / **Get Quote** + WhatsApp. Trust caption. |
| 8 | **Footer** | Per components §9. |

Mobile: sticky bottom bar (WhatsApp + Get Quote) appears after hero scrolls off.

---

## SELL FLOW (5 steps)

Shared shell (`app/sell/layout.tsx`): **StepProgress** header (sticky), centered content (max ~640), sticky footer nav (Back ghost · Continue primary, full-width mobile). Each step = one URL (deep-linkable, back-safe, state preserved). Autosave draft to localStorage.

**StepProgress** — 5 segments, current `brand` filled + label, done `success` + `Check`, upcoming `neutral-200`. Bar animates 300ms. Mobile: "Step 3 of 5" + slim bar.

| Step | Page | Content | Key components |
|---|---|---|---|
| 1 | **Select Device** | Brand/model search → model grid → storage + color | Search, Radio cards |
| 2 | **Device Details** | Storage (if not set), color, purchase age, warranty, IMEI (mono input), accessories/box toggle | Select, Radio cards, Input |
| 3 | **Condition Assessment** | Battery health (radio cards w/ ₹ hints), screen condition, body condition, functional checklist (Face ID, camera…), **photo upload** | Radio cards, Checklist, Upload |
| 4 | **Contact Details** | Name, mobile (tel, OTP-ready), pickup address, preferred date/slot, city select | Input, Select, date/slot picker |
| 5 | **Quote Summary** | **Quote Summary Card** (live amount) + breakdown + **Schedule Pickup** primary + WhatsApp. Confirmation on submit → order id + Track link. | Quote Summary Card, Toast |

Live quote: amount recalcs as condition changes (debounced, skeleton while computing). Never block input.

---

## TRACK ORDER PAGE

`/track/[orderId]` — lookup (order id / phone + OTP) → status view.
**Vertical timeline:** Quote → Pickup Scheduled → Inspected → Payment → Completed. Each node: StatusBadge + timestamp (mono) + note. Current node `brand` pulse (reduced-motion safe); done `success` check; future `neutral-300`.
Side/below: device + quote summary, pickup ETA (`Truck`, `Clock`), support **WhatsApp** + **Call** buttons. Empty/invalid id → helpful empty state + retry.

---

## ADMIN DASHBOARD

`background` canvas, left sidebar (≥1024) / bottom-or-top nav (<1024). Sidebar: logo, nav (Orders, Pickups, Payments, Inspections, Settings), active item `brand-subtle` + `brand` text.

**Stat row** — 4 KPI cards (`surface`, `shadow-xs`): New leads, Pickups today, Pending inspection, Paid this week. Big mono number + delta chip + sparkline.

**Admin Table** (Orders)
- Columns: Order ID (mono) · Customer · Device · Quote (mono, right-aligned) · Status (badge) · Date · Actions.
- Header `neutral-50`, sortable (`aria-sort`), zebra `surface`/`neutral-50`, row hover `neutral-100`, row min-h 56.
- Toolbar: search, status filter chips, date range, export CSV. Sticky header, pagination/virtualize 50+.
- Mobile: table → stacked cards (device + status + quote + chevron).

**Order Detail Screen**
- Header: order id (mono) + StatusBadge + status-change action (Select / buttons: Mark Inspected, Schedule Pickup, Mark Paid, Reject — destructive separated, confirm dialog).
- Panels: Device & condition (with uploaded photos gallery), Customer & address, Quote breakdown (editable for inspector adjustment, mono), Activity timeline, Payment (UPI/bank ref, mono). Save → toast.

---

## FORMS — reusable architecture

**Stack:** React Hook Form + Zod resolver. One `<FormField>` wrapper drives label, control, helper, error, required marker, and `aria` wiring so every field is consistent.

```tsx
<FormField name="mobile" label="Mobile number" required
  helper="We'll send pickup updates here">
  <Input type="tel" inputMode="numeric" autoComplete="tel"
         placeholder="10-digit mobile number" />
</FormField>
```

### Field catalogue
| Field | Control | Validation (Zod) | Keyboard |
|---|---|---|---|
| Phone Model | Searchable select / radio grid | required | — |
| Storage | Radio cards | required, in enum | — |
| Battery Health | Radio cards | required | — |
| Condition | Radio cards + checklist | required | — |
| Name | Input | required, 2–60 chars | default |
| Phone Number | Input `tel` | `/^[6-9]\d{9}$/` (India 10-digit) | numeric |
| Address | Textarea | required, ≥10 chars | — |
| Pincode | Input | `/^\d{6}$/`, serviceable-area check | numeric |
| Date/Slot | Select / picker | required, future only | — |
| Photo Upload | Upload component | ≥ required slots, type/size | — |

### Validation & messaging rules
- **Validate on blur**, re-validate on change once errored. Never on first keystroke.
- **Error** below field, `role="alert"`, tied via `aria-describedby`; border `error-500` + `shadow-focus-error`. State cause **and** fix.
  - ✅ "Enter a valid 10-digit mobile number starting 6–9."  ❌ "Invalid input."
- On submit: disable button + spinner; if errors → focus first invalid + summary at top (anchored) for 2+ errors.
- **Success:** inline `CheckCircle2` `success` + toast / next-step transition; `aria-live` announces.
- **Required** marked with `*` (`error-500`); helper text persists (not placeholder-only).
- **Progressive disclosure** — reveal accessories/IMEI only when relevant; don't overwhelm step 1.
- **Autosave** sell-flow drafts; confirm before dismissing a sheet with unsaved changes.

---

## Motion in flows
Step transitions: forward slide-left + fade (300ms enter), back slide-right (180ms exit) — directional consistency. Quote amount: count-up ≤400ms (reduced-motion → instant). Progress bar + check fills 300ms. One hero element animates on load (`fade-in-up`), nothing competing.
