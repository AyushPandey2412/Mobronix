# AUTH_SETUP.md — Google Login + Mobile OTP (Backend + Frontend)

How to add **real** Google sign-in and **phone-number OTP** login to SellMyiPhone,
using Supabase Auth. Covers Supabase/Google config (backend) and the exact code
to add to this project (frontend).

> Current state: the seller flow uses a **local demo login** (Zustand `user`, no real
> auth). `lib/auth.ts` already wraps the Supabase calls, but two pieces are missing:
> (1) an **OAuth callback route**, and (2) a **bridge** that turns a Supabase session
> into the app's `user`. This guide adds both, then wires the UI.

---

## Part A — Backend (Supabase) configuration

### A1. Google OAuth

**1) Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com))
- Create/select a project → **APIs & Services → OAuth consent screen** → External → fill app name, support email, save.
- **APIs & Services → Credentials → Create Credentials → OAuth client ID**
  - Application type: **Web application**
  - **Authorized JavaScript origins:**
    - `http://localhost:3000`
    - `https://your-app.vercel.app` (your production URL)
  - **Authorized redirect URIs** — add the **Supabase** callback (Supabase shows it on the provider page):
    - `https://tndbjposrliqshigmdvm.supabase.co/auth/v1/callback`
  - Copy the **Client ID** and **Client Secret**.

**2) Supabase Dashboard** → **Authentication → Providers → Google**
- Toggle **Enable**.
- Paste **Client ID** + **Client Secret**. Save.

**3) Supabase → Authentication → URL Configuration**
- **Site URL:** `https://your-app.vercel.app` (use `http://localhost:3000` while developing).
- **Redirect URLs:** add
  - `http://localhost:3000/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

That's it for Google on the backend.

---

### A2. Phone / Mobile OTP

Supabase can send OTP SMS, but it needs a **third-party SMS provider** — there's no
built-in sender. Pick one and connect it.

**1) Choose an SMS provider** (any one):
- **Twilio** (incl. *Twilio Verify*) — easiest, works in India.
- **Vonage**, **MessageBird**, **Textlocal**.

**2) Supabase → Authentication → Providers → Phone**
- Toggle **Enable Phone provider**.
- Select your **SMS provider** and paste its credentials
  (e.g. Twilio Account SID, Auth Token, Message Service SID / From number).
- Set **OTP expiry** (default 60s–3600s) and **OTP length** (6).

**3) ⚠️ India-specific (DLT)**
For sending SMS to Indian numbers you must complete **TRAI DLT registration**:
- Register your business + sender header (Sender ID) on a DLT portal (Jio/Airtel/Vodafone Idea).
- Register the **OTP template** content and get it approved.
- Add the approved Sender ID / template in your SMS provider (Twilio/MSG91).
Without DLT, Indian carriers will block your OTP SMS. (Twilio *Verify* can simplify this.)

**4) Costs:** SMS is paid per message (~₹0.10–0.25 in India + provider fees). Budget for it.

> **Tip for dev/testing without SMS:** Supabase → Auth → Providers → Phone →
> **"Test OTP"** lets you hardcode a phone+code pair so you can build the UI before
> wiring a real SMS provider.

---

## Part B — Frontend (code changes in this project)

### B1. Add the OAuth callback route ⚠️ REQUIRED for Google

Google redirects back with a `?code=...`. You must exchange it for a session.
Create **`app/auth/callback/route.ts`**:

```ts
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'

// Handles the redirect back from Google (and magic links).
export async function GET(req: Request) {
  const url  = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createRouteClient()
    await supabase.auth.exchangeCodeForSession(code) // sets the session cookie
  }
  return NextResponse.redirect(new URL(next, url.origin))
}
```

### B2. Bridge the Supabase session → app `user` ⚠️ REQUIRED

The whole app reads `useStore(s => s.user)`. After a Supabase login we must mirror the
Supabase user into that store. Create **`components/shared/AuthSync.tsx`**:

```tsx
"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

export function AuthSync() {
  useEffect(() => {
    const sb = createBrowserClient();

    async function hydrate(u: { id: string; email?: string | null; phone?: string | null; user_metadata?: any }) {
      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", u.id)
        .single();

      useStore.setState({
        user: {
          name:
            profile?.full_name ??
            u.user_metadata?.full_name ??
            u.user_metadata?.name ??
            u.email?.split("@")[0] ??
            "Seller",
          mobile: profile?.phone ?? u.phone ?? "",
          role: profile?.role === "admin" ? "admin" : "seller",
        },
      });
    }

    // On load: if a Supabase session already exists, mirror it.
    sb.auth.getUser().then(({ data: { user } }) => { if (user) hydrate(user); });

    // On every auth change (Google return, OTP verify, sign-out).
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (session?.user) hydrate(session.user);
      else if (event === "SIGNED_OUT") useStore.setState({ user: null });
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
```

Mount it once — in **`components/shared/Providers.tsx`** (inside the provider tree):

```tsx
import { AuthSync } from "./AuthSync";
// ...
return (
  <QueryClientProvider client={client}>
    <AuthSync />
    {children}
    {/* ...toaster etc... */}
  </QueryClientProvider>
);
```

> Make `logout()` in `lib/store.ts` also call Supabase sign-out, so Google/OTP users
> actually log out:
> ```ts
> // in the logout action, before clearing state:
> import { createBrowserClient } from "@/lib/supabase/client";
> createBrowserClient().auth.signOut();
> ```

### B3. Wire Google into the UI

`lib/auth.ts` already has `signInWithGoogle(redirectTo)`. Add a button anywhere you
show login (e.g. `components/shared/AuthForm.tsx`, the login page, or `PriceUnlockModal`):

```tsx
import { signInWithGoogle } from "@/lib/auth";

async function handleGoogle() {
  const origin = window.location.origin;
  // send users back to /auth/callback, then on to where they were
  await signInWithGoogle(`${origin}/auth/callback?next=/sell/quote`);
  // OAuth navigates away; AuthSync picks up the session on return.
}

<button onClick={handleGoogle} className="...">Continue with Google</button>
```

### B4. Wire phone OTP into the UI

`lib/auth.ts` has `sendPhoneOtp(phone)` and `verifyPhoneOtp(phone, token)`.
Phone must be **E.164** format (e.g. `+919876543210`). Example two-step flow
(replace the fake `phoneLogin` in `PriceUnlockModal.tsx` with this):

```tsx
import { useState } from "react";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth";

const [phone, setPhone] = useState("");
const [otp, setOtp] = useState("");
const [sent, setSent] = useState(false);
const [busy, setBusy] = useState(false);
const [err, setErr] = useState<string | null>(null);

const fullPhone = `+91${phone}`; // 10-digit input → E.164

async function send() {
  setErr(null); setBusy(true);
  const { error } = await sendPhoneOtp(fullPhone);
  setBusy(false);
  if (error) return setErr(error.message);
  setSent(true);
}

async function verify() {
  setErr(null); setBusy(true);
  const { error } = await verifyPhoneOtp(fullPhone, otp);
  setBusy(false);
  if (error) return setErr(error.message);
  // success — AuthSync mirrors the session into the store, price unlocks.
  onSuccess?.();
}
```

UI: show the phone input + **Send OTP** first; after `sent`, show a 6-digit OTP input +
**Verify & Continue**. (Your `PriceUnlockModal` already has the phone field and layout —
just swap its `phoneLogin` call for `send()` / `verify()` and add the OTP step.)

### B5. Make the seller flow respect real auth

- `app/sell/quote/page.tsx` and `app/sell/checkout/page.tsx` already gate on
  `useStore(s => s.user)`. Once `AuthSync` sets `user` from the Supabase session,
  those gates pass automatically — no other change needed.
- The **enquiry insert** (`app/api/enquiry/route.ts`) reads the Supabase session via
  `createRouteClient()`, so a logged-in OTP/Google user's enquiry is linked to their
  `user_id` automatically.

---

## Part C — Profiles table (already handled)

`migrations/001_initial.sql` has a `handle_new_user` trigger that auto-creates a
`profiles` row for every new auth user (Google or phone). So no manual profile creation
is needed. For phone signups, `profiles.full_name` will be empty until the user provides
it — the app falls back to "Seller".

To make a Google/OTP user an **admin**:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'someone@gmail.com';
-- (phone-only users: match by phone instead of email)
```

---

## Part D — Env vars

- **Google:** nothing extra in the app — the Client ID/Secret live in **Supabase**, not in
  `.env`. (The `GOOGLE_CLIENT_ID/SECRET` entries in `.env.local` are optional/documentation.)
- **Phone:** SMS provider creds live in **Supabase**, not in the app.
- Ensure `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set (already are).

---

## Part E — Test checklist

**Google**
- [ ] Click "Continue with Google" → Google consent → returns to `/auth/callback` → lands logged in.
- [ ] Header shows your name; quote price unlocks; refresh keeps you logged in (cookie session).

**Phone OTP**
- [ ] Enter mobile → "Send OTP" → receive SMS (or use Test OTP in dev).
- [ ] Enter code → "Verify" → logged in, price unlocks.
- [ ] Enquiry submits and is linked to your account in `/admin`.

**General**
- [ ] Logout clears both the local store and the Supabase session.
- [ ] An admin (role set in `profiles`) is redirected to `/admin` after login.

---

## Summary — files to add / change

| File | Change |
|---|---|
| `app/auth/callback/route.ts` | **NEW** — exchange OAuth code for session (B1) |
| `components/shared/AuthSync.tsx` | **NEW** — mirror Supabase session → store (B2) |
| `components/shared/Providers.tsx` | mount `<AuthSync />` (B2) |
| `lib/store.ts` | `logout()` also calls Supabase `signOut()` (B2) |
| `components/shared/AuthForm.tsx` / `PriceUnlockModal.tsx` | add Google button + OTP flow (B3, B4) |
| Supabase dashboard | enable Google + Phone providers, redirect URLs (Part A) |
| Google Cloud + SMS/DLT | OAuth credentials + SMS provider (Part A) |

`lib/auth.ts` already contains `signInWithGoogle`, `sendPhoneOtp`, `verifyPhoneOtp` — you
mostly need the callback route, the session bridge, and the UI wiring above.
