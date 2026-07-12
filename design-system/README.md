# SellMyiPhone — Design System

> Trust-first iPhone resale & instant-payment platform — Mumbai · Navi Mumbai · Thane.
> Not e-commerce. Goal: **build trust → capture lead → instant quote → schedule pickup → instant payment.**

A single source of truth that lets a **designer build it in Figma** and a **developer ship it in Next.js 15** from the same tokens.

---

## Design DNA

A blend of five references, each contributing one trait:

| Reference | What we borrow |
|-----------|----------------|
| **Apple Trade In** | Calm whitespace, restraint, product-as-hero, premium typography |
| **Cashify** | Clear resale flow, condition/quote logic, India-market trust cues |
| **Razorpay** | Fintech confidence, payment-grade trust signals, blue authority |
| **Linear** | Crisp surfaces, subtle depth, precise type, fast micro-interactions |
| **Stripe** | Documentation-grade clarity, gradient accents, developer polish |

**Personality:** Trustworthy · Premium · Fast · Modern · Professional · Minimal · Mobile-first.
**Never:** cheap, flashy, gradient-soup, template-y, cluttered.

---

## Files

| File | For |
|------|-----|
| [`foundations.md`](./foundations.md) | Color, typography, spacing, radius, shadow, icons, grid, motion |
| [`components.md`](./components.md) | Every component spec + all states |
| [`patterns.md`](./patterns.md) | Page systems (Home, Sell Flow, Track, Admin) + forms architecture |
| [`figma-variables.md`](./figma-variables.md) | Figma variable collections, modes, naming |
| [`../tokens/design-tokens.json`](../tokens/design-tokens.json) | Machine-readable tokens (Style Dictionary / Tokens Studio) |
| [`../tailwind.config.ts`](../tailwind.config.ts) | Tailwind theme |
| [`../app/globals.css`](../app/globals.css) | CSS variables + base layer |

---

## Core principles (in priority order)

1. **Accessibility first** — WCAG AA. 4.5:1 text contrast, visible focus rings, keyboard-complete, never color-alone.
2. **Touch first** — every target ≥ 44×44px, ≥ 8px apart, feedback within 100ms.
3. **Mobile first** — design at 390px, scale up. Never disable zoom. No horizontal scroll.
4. **Low cognitive load** — one primary CTA per screen, progressive disclosure, scannable hierarchy.
5. **Conversion focused** — trust signals near every decision point; quote & WhatsApp always one tap away.
6. **Token-driven** — components reference *semantic* tokens, never raw hex.

---

## Naming convention

**Tokens** — `category-role-scale`: `color-primary-600`, `space-4`, `radius-lg`, `shadow-md`.
**Semantic roles** — `surface`, `text-secondary`, `border-strong`, `brand-hover`.

**Components** — PascalCase files, kebab folders:
```
Button.tsx · QuoteSummaryCard.tsx · StatusBadge.tsx · DeviceConditionStep.tsx
```
**Props** — `variant`, `size`, `state`, `intent`. Booleans read affirmatively: `isLoading`, `hasError`, `isSelected`.
**Variants** — `primary | secondary | outline | ghost | whatsapp` (button); `success | warning | error | info | neutral` (status).

---

## Folder structure (Next.js 15, App Router)

```
sellmyiphone/
├─ app/
│  ├─ (marketing)/              # Home, How it works, Reviews, FAQ
│  │  └─ page.tsx
│  ├─ sell/                     # Multi-step sell flow
│  │  ├─ layout.tsx             # Step progress shell
│  │  ├─ device/page.tsx        # Step 1
│  │  ├─ details/page.tsx       # Step 2
│  │  ├─ condition/page.tsx     # Step 3
│  │  ├─ contact/page.tsx       # Step 4
│  │  └─ quote/page.tsx         # Step 5
│  ├─ track/[orderId]/page.tsx  # Track order
│  ├─ admin/                    # Protected dashboard
│  │  ├─ layout.tsx
│  │  ├─ orders/page.tsx        # Table
│  │  └─ orders/[id]/page.tsx   # Detail
│  ├─ globals.css
│  └─ layout.tsx                # Root: fonts, providers
├─ components/
│  ├─ ui/                       # shadcn primitives (button, input, select…)
│  ├─ forms/                    # Field wrappers, validation
│  ├─ marketing/                # Hero, ModelSelector, ProcessStep, ReviewCard
│  ├─ sell/                     # RadioCard, UploadImage, QuoteSummaryCard, StepProgress
│  └─ shared/                   # Navbar, Footer, StatusBadge, TrustBadge
├─ features/                    # Domain logic (quote engine, pricing)
├─ lib/                         # utils, cn(), validators (zod), constants
├─ tokens/design-tokens.json
├─ tailwind.config.ts
└─ design-system/               # ← this folder
```

---

## Stack

Next.js 15 (App Router, RSC) · TypeScript · TailwindCSS · shadcn/ui · Lucide React · Framer Motion · React Hook Form + Zod.

## Accessibility checklist (ship gate)

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 large) — verified, not assumed
- [ ] Every interactive element keyboard-reachable, focus ring visible
- [ ] Icon-only buttons have `aria-label`
- [ ] Form fields: visible `<label>`, error tied via `aria-describedby`, `role="alert"`
- [ ] Touch targets ≥ 44px, spacing ≥ 8px
- [ ] Status communicated by icon + text, not color alone
- [ ] `prefers-reduced-motion` honored (handled globally in `globals.css`)
- [ ] Tested at 390px and largest Dynamic Type
