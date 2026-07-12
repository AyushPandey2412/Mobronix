# STATE.md — Zustand + TanStack Query guide

Everything about how state is managed, where data lives, and how to change it.

---

## Table of contents

1. [Two systems, one purpose](#1-two-systems)
2. [Zustand — what it stores](#2-zustand)
3. [Zustand — all actions](#3-zustand-actions)
4. [Zustand — localStorage persistence](#4-zustand-persistence)
5. [TanStack Query — what it caches](#5-tanstack-query)
6. [TanStack Query — query keys](#6-query-keys)
7. [TanStack Query — all mutations](#7-mutations)
8. [Cache invalidation chain](#8-cache-invalidation)
9. [How data flows through the sell flow](#9-sell-flow-data)
10. [How data flows through the admin panel](#10-admin-data)
11. [Common changes](#11-common-changes)

---

## 1. Two systems

The project uses two state libraries that serve different purposes. They do not overlap.

| | Zustand | TanStack Query |
|-|---------|---------------|
| **What it stores** | User session, sell flow progress, cart, settings | Remote data from Supabase (models, questions, enquiries, history) |
| **Where it persists** | localStorage (subset of fields) | In-memory cache (cleared on page refresh) |
| **Updated by** | User interactions (select model, answer question, set address) | Supabase reads and admin mutations |
| **File** | `lib/store.ts` | `lib/adminQueries.ts`, `lib/queryClient.ts` |
| **Accessed via** | `useStore(s => s.fieldName)` | `useQuery(...)`, `useMutation(...)` |

---

## 2. Zustand

**File:** `lib/store.ts`

The single Zustand store holds everything about the active user session and the current sell flow.

### State fields

#### Auth

| Field | Type | Purpose |
|-------|------|---------|
| `user` | `User \| null` | Logged-in seller. Has `name`, `mobile`, `role`. `null` if not logged in. |

#### Sell flow (reset to null after submission)

| Field | Type | Purpose |
|-------|------|---------|
| `selectedModelId` | `string \| null` | ID of the model the user tapped on the homepage. |
| `selectedStorage` | `string \| null` | Storage tier picked on `/sell/storage`. |
| `answers` | `AnswerMap` | Record of `{ questionIndex: answer }` from condition quiz. |
| `quote` | `Quote \| null` | Computed result from `computeQuote()`. Has `base`, `final`, `breakdown`. |
| `photos` | `Record<string, PhotoState>` | Per-slot: `{ done: boolean, path: string \| null }`. Path is the Supabase Storage path after upload. |
| `cart` | `CartDevice[]` | Devices added to the multi-device cart. Each has model, storage, final price. |
| `checkout` | `CheckoutForm` | `{ address, pincode, slot, pay }` filled in on `/sell/checkout`. |

#### Post-submission tracking

| Field | Type | Purpose |
|-------|------|---------|
| `enquiry` | `Enquiry \| null` | The most recent submitted enquiry. Used by `/sell/confirm` and `/track`. |
| `lastSeenStep` | `number` | The tracking step the user last saw. Used to show the "update" badge in bottom nav. |
| `editingEnquiry` | `boolean` | True when the user is editing pickup details from the track page. |

#### Catalog (not persisted — comes from Supabase)

| Field | Type | Purpose |
|-------|------|---------|
| `models` | `Model[]` | All models. Seeded from `lib/data.ts`. Overwritten by TanStack Query with Supabase data. |
| `questions` | `Question[]` | iPhone condition questions. Seeded from `lib/data.ts`. |
| `enquiries` | `Enquiry[]` | Demo seed enquiries. Not persisted. |

#### Settings

| Field | Type | Purpose |
|-------|------|---------|
| `settings` | `Settings` | `{ pushNotif, smsUpdates, language }`. Persisted. |

---

## 3. Zustand actions

All actions are in `lib/store.ts`. Call them via `useStore(s => s.actionName)`.

### Auth actions

| Action | What it does |
|--------|-------------|
| `login(identity, password)` | Checks for demo admin (`admin` / `admin123`). Otherwise creates a local seller user from the name/phone input. Returns `{ ok, role, error }`. |
| `logout()` | Clears user, resets the entire sell flow, clears enquiry. |

### Sell flow actions

| Action | What it does |
|--------|-------------|
| `selectModel(id)` | Sets `selectedModelId`, clears `selectedStorage`. |
| `setStorage(s)` | Sets `selectedStorage`. |
| `setAnswer(qIndex, answer)` | Saves one condition question answer. Clears `quote` so it gets recomputed. |
| `resetSellFlow()` | Clears model, storage, answers, quote, photos, cart, checkout. Used when navigating back to home. |
| `computeQuote()` | Reads the selected model + storage, applies all answer factors via `lib/quote.ts`, returns a `Quote` object, and saves it to state. |
| `setPhoto(slotId, state)` | Merges `{ done, path }` into the photos record for one slot. |
| `addCurrentToCart()` | Moves the current model/storage/quote into the cart as a `CartDevice`. |
| `removeFromCart(index)` | Removes a device from the cart by index. |

### Checkout actions

| Action | What it does |
|--------|-------------|
| `setCheckout(patch)` | Merges a partial `CheckoutForm` into `checkout`. |
| `submitEnquiry()` | Builds a local `Enquiry` object from current state and saves it to `enquiry`. Does **not** call the API — the checkout page does that separately then calls `patchCurrentEnquiry`. |
| `patchCurrentEnquiry(patch)` | Merges a partial `Enquiry` into the current `enquiry`. Used by checkout to overwrite the local ID with the real `display_id` and `assigned_exec` from the API response. |

### Tracking actions

| Action | What it does |
|--------|-------------|
| `startEditPickup()` | Sets `editingEnquiry = true` and copies current enquiry's address/slot/pay into checkout for editing. |
| `updateEnquiryPickup()` | Merges the updated checkout fields into the current enquiry. |
| `cancelEnquiry()` | Sets enquiry status to `cancelled`. |
| `rateEnquiry(rating)` | Sets `enquiry.rating`. |
| `advanceTracking()` | Increments `enquiry.step` by 1 (demo mode). |
| `markStepSeen()` | Sets `lastSeenStep = enquiry.step`. Clears the update badge in bottom nav. |

### Settings actions

| Action | What it does |
|--------|-------------|
| `toggleSetting(key)` | Flips `pushNotif` or `smsUpdates` boolean. |
| `setLanguage(lang)` | Sets `language` to `'EN'` or `'HI'`. |

---

## 4. Zustand persistence

**Key:** `"sellmyiphone"` in localStorage.

Only these fields are persisted (everything else is recomputed or fetched):

```ts
// lib/store.ts → partialize
{
  user,            // keep logged-in across page refreshes
  enquiry,         // keep current sell enquiry (for /track page)
  cart,            // keep multi-device cart
  selectedModelId, // resume sell flow after login redirect
  selectedStorage,
  answers,
  quote,
  photos,          // Record<slotId, { done, path }>
  settings,        // notifications + language
  lastSeenStep,    // for update badge in bottom nav
}
```

**What is intentionally NOT persisted:**

| Field | Why not persisted |
|-------|-----------------|
| `models` | Comes from Supabase via TanStack Query. Would be stale and ~80KB. |
| `questions` | Same — comes from Supabase. |
| `enquiries` | Admin list — not needed in localStorage. Supabase is the source of truth. |
| `editingEnquiry` | Transient UI state — reset on next visit. |
| `checkout` | Cleared after submit. |

**To add a new persisted field:** Add it to the `partialize` object in `lib/store.ts`.

**To clear persisted state programmatically:**
```ts
localStorage.removeItem('sellmyiphone')
// or
useStore.persist.clearStorage()
```

---

## 5. TanStack Query

**Config file:** `lib/queryClient.ts`

**Provider:** `components/shared/Providers.tsx` wraps the entire app in `QueryClientProvider`.

TanStack Query is used for all **Supabase reads and admin writes**. It caches remote data in memory and invalidates it when mutations succeed.

**Default settings:**

| Setting | Value | Meaning |
|---------|-------|---------|
| `staleTime` | 60 seconds | Data is considered fresh for 60s. No refetch within that window. |
| `gcTime` | 5 minutes | Unused cache entries are garbage collected after 5 min. |
| `refetchOnWindowFocus` | false | No refetch when the tab regains focus. |
| `retry` | 1 | Retry failed queries once before showing an error. |

**Public queries (sell flow):** `staleTime` is 5 minutes (`5 * 60 * 1000`) because model prices and questions change rarely.

---

## 6. Query keys

All query keys are in `lib/adminQueries.ts`. Always use these constants — never write raw array query keys.

### Admin keys (authenticated, admin panel)

```ts
QK.enquiries()           // ['enquiries']        — all enquiries list
QK.enquiry(id)           // ['enquiry', id]       — single enquiry
QK.enquiryHistory(id)    // ['enquiry-history', id]  — history for one enquiry
QK.models()              // ['models']            — all models (admin view)
QK.questions()           // ['questions']         — all questions (admin view)
```

### Public keys (sell flow, visible to all)

```ts
QK_PUBLIC.models()       // ['public-models']     — active models for homepage + sell flow
QK_PUBLIC.questions()    // ['public-questions']  — active questions for condition page
```

**Why separate keys?** Admin reads all models including inactive ones. The sell flow only reads active models. They must have different cache keys so invalidating the admin cache doesn't affect the sell flow cache and vice versa.

---

## 7. Mutations

All `mutationFn` implementations live in `lib/adminQueries.ts`. Components import them and pass them to `useMutation`.

### Enquiry mutations (Dashboard, OrderDetail)

| Function | Used in | What it does |
|----------|---------|-------------|
| `bulkUpdateEnquiryStatus(sb, { ids, status })` | Dashboard | Updates status of multiple enquiries at once. |
| `bulkDeleteEnquiries(sb, ids)` | Dashboard | Deletes multiple enquiries. |
| `updateEnquiryStatus(sb, { id, status, step, note })` | OrderDetail | Updates one enquiry's status, tracking step, and internal note. |
| `addEnquiryHistory(sb, { enquiryId, actor, action })` | OrderDetail | Inserts a history row. Called after every status change. |
| `deleteEnquiry(sb, id)` | OrderDetail | Deletes one enquiry and its history. |

### Model mutations (ProductsClient)

| Function | Used in | What it does |
|----------|---------|-------------|
| `patchModel(sb, { id, patch })` | ProductsClient | Updates specific fields (is_active, sort_order). |
| `upsertModel(sb, { payload, existingId? })` | ProductsClient | Creates or updates a full model. |

### Question mutations (QuestionsClient)

| Function | Used in | What it does |
|----------|---------|-------------|
| `patchQuestion(sb, { id, patch })` | QuestionsClient | Updates specific fields (order_index). |
| `upsertQuestion(sb, { payload, existingId? })` | QuestionsClient | Creates or updates a full question. |
| `deleteQuestion(sb, id)` | QuestionsClient | Deletes one question. |

---

## 8. Cache invalidation

When a mutation succeeds, it calls `qc.invalidateQueries(...)` to mark the relevant cache as stale. TanStack Query then refetches in the background — the UI updates automatically.

**The full chain:**

```
Admin edits a model (ProductsClient)
    └─► patchModel / upsertModel mutationFn runs
    └─► onSuccess:
            qc.invalidateQueries(QK.models())         ← admin list refreshes
            qc.invalidateQueries(QK_PUBLIC.models())  ← sell flow refreshes

Admin edits a question (QuestionsClient)
    └─► upsertQuestion / deleteQuestion mutationFn runs
    └─► onSuccess:
            qc.invalidateQueries(QK.questions())
            qc.invalidateQueries(QK_PUBLIC.questions())

Admin saves an order (OrderDetail)
    └─► updateEnquiryStatus + addEnquiryHistory mutationFn runs
    └─► onSuccess:
            qc.invalidateQueries(QK.enquiries())           ← dashboard list refreshes
            qc.invalidateQueries(QK.enquiryHistory(id))    ← history on this order refreshes

Admin bulk-updates or bulk-deletes (Dashboard)
    └─► bulkUpdateEnquiryStatus / bulkDeleteEnquiries runs
    └─► onSuccess:
            qc.invalidateQueries(QK.enquiries())
```

**To add a new mutation that should refresh the sell flow:** Add `qc.invalidateQueries({ queryKey: QK_PUBLIC.models() })` in the `onSuccess` callback.

---

## 9. How data flows through the sell flow

```
Homepage (app/page.tsx — server component)
    │
    ├─ createServerClient() fetches active models from Supabase
    │   → passed as initialModels to HomePageClient
    │
    └─ HomePageClient renders ModelSelector with initialModels
           │
           ├─ useQuery(QK_PUBLIC.models(), { initialData: initialModels })
           │   No client fetch needed on first load — initialData is used.
           │   After 5 min staleTime, next visit refetches from Supabase.
           │
           └─ User taps a model
                   │
                   ├─ selectModel(id) — saves ID to Zustand
                   ├─ Supabase model object synced into Zustand store
                   └─ router.push('/sell/storage')

/sell/storage — reads useActiveModel() from Zustand store
    User picks storage/chip
    └─ setStorage(s) — Zustand

/sell/condition — reads useActiveModel() + useQuery(QK_PUBLIC.questions())
    User answers questions
    └─ setAnswer(i, answer) — Zustand
    computeQuote() on last question — multiplies base price by all factors

/sell/quote — reads quote from Zustand

/sell/photos — user selects photos
    └─ PhotoUploader uploads to Supabase Storage
    └─ setPhoto(slotId, { path }) — Zustand

/sell/checkout — user fills address/slot/pay
    └─ setCheckout(patch) — Zustand
    Submit:
    ├─ fetch('POST /api/enquiry') with all data including photo paths
    ├─ submitEnquiry() — builds local Enquiry in Zustand
    └─ patchCurrentEnquiry({ id, display_id, exec }) — overwrites with real API values

/sell/confirm — reads enquiry from Zustand (has real display_id now)

/track — reads enquiry from Zustand
```

---

## 10. How data flows through the admin panel

```
/admin (app/admin/page.tsx — client component)
    │
    └─ useQuery(QK.enquiries())
           queryFn: fetchEnquiries(sb)  — from lib/adminQueries.ts
           Falls back to Zustand seed enquiries if Supabase returns empty

/admin/orders/[id] (app/admin/orders/[id]/page.tsx — server component)
    │
    ├─ createServerClient() fetches enquiry + history (server-side, fast)
    └─ passes as props to OrderDetail client component
           │
           └─ useQuery(QK.enquiryHistory(id), { initialData: history })
               Refetches history after every save mutation

/admin/products (app/admin/products/page.tsx — client component)
    └─ useQuery(QK.models())

/admin/questions (app/admin/questions/page.tsx — client component)
    └─ useQuery(QK.questions())
```

---

## 11. Common changes

### Add a new field to the sell flow

1. Add the field to `AppState` interface in `lib/store.ts`.
2. Initialize it in the `create()` call (usually `null` or `{}`).
3. Add a setter action.
4. Add it to `partialize` if it should survive page refresh.
5. Reset it in `resetSellFlow()` and `submitEnquiry()`.

### Add a new condition question to the quiz

1. Go to `/admin/questions` in the app and add it there — it saves to Supabase.
2. It will appear in the condition flow for customers immediately (TanStack Query caches for 5 min).
3. If you also want it in the local fallback (for demo mode without Supabase), add it to `lib/data.ts` → `QUESTIONS` or `MAC_QUESTIONS`.

### Change the quote calculation

Edit `lib/quote.ts` → `calcQuote(base, answers, questions)`. The function multiplies the base price by each answer's factor, clamps negative deductions, and rounds to the nearest 100.

### Make a new admin query (e.g. fetch recent reviews)

1. Add the query key to `QK` in `lib/adminQueries.ts`:
   ```ts
   reviews: () => ['reviews'] as const,
   ```
2. Add the `queryFn`:
   ```ts
   export async function fetchReviews(sb: SupabaseClient) {
     const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: false })
     if (error) throw error
     return data
   }
   ```
3. Use in a component:
   ```ts
   const { data: reviews } = useQuery({
     queryKey: QK.reviews(),
     queryFn: () => fetchReviews(sb),
   })
   ```

### Change the TanStack Query cache duration

Edit `lib/queryClient.ts`:
```ts
defaultOptions: {
  queries: {
    staleTime: 2 * 60 * 1000,  // 2 minutes instead of 1
    gcTime:    10 * 60 * 1000, // 10 minutes garbage collection
  }
}
```

Or override per-query:
```ts
useQuery({
  queryKey: QK.models(),
  queryFn: () => fetchModels(sb),
  staleTime: 10 * 60 * 1000,  // models change rarely — cache longer
})
```

### Force a cache refresh manually

```ts
const qc = useQueryClient()
qc.invalidateQueries({ queryKey: QK.models() })  // marks stale, refetches
// or
qc.refetchQueries({ queryKey: QK.models() })      // refetches immediately
```

### Access Zustand state outside React

```ts
import { useStore } from '@/lib/store'

// Get current state snapshot
const state = useStore.getState()

// Set state
useStore.setState({ selectedModelId: 'iphone-16' })

// Subscribe to changes
const unsub = useStore.subscribe((state) => {
  console.log('enquiry changed:', state.enquiry)
})
unsub() // cleanup
```
