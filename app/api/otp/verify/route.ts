import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyOtp } from '@/lib/otp'
import { rateLimit, clientIp } from '@/lib/ratelimit'
import { createServiceClient, createRouteClient } from '@/lib/supabase/server'
import { AUTH_ACTIVITY_COOKIE, authCookieOptions } from '@/lib/authSession'

export const runtime = 'nodejs'

const schema = z.object({
  mobile: z.string().regex(/^\d{10}$/),
  code:   z.string().regex(/^\d{4,6}$/),
  name:   z.string().optional(),
})

export async function POST(req: Request) {
  const ip = clientIp(req)
  const rl = await rateLimit(`otp-verify:${ip}`, 15, 10 * 60)   // 15 tries / 10 min / IP
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  let body
  try { body = schema.parse(await req.json()) }
  catch { return NextResponse.json({ error: 'Enter the code we sent you.' }, { status: 400 }) }

  // 1. Verify OTP check
  const otpRes = await verifyOtp(body.mobile, body.code)
  if (!otpRes.ok) return NextResponse.json({ error: otpRes.error }, { status: 400 })

  // 2. Real Auth integration — find or create genuine Supabase Auth user
  const serviceClient = createServiceClient()
  const routeClient = await createRouteClient()
  const { data: { user: currentUser } } = await routeClient.auth.getUser()

  if (currentUser) {
    const currentPhone =
      currentUser.phone?.replace(/\D/g, '').slice(-10) ||
      currentUser.user_metadata?.phone?.replace(/\D/g, '').slice(-10) ||
      ''

    if (currentPhone && currentPhone !== body.mobile) {
      return NextResponse.json(
        { error: 'You are already logged in with another mobile number. Please log out before using a different account.' },
        { status: 409 }
      )
    }
  }

  const password = Math.random().toString(36).slice(-16) + 'A1!'
  const email = `${body.mobile}@sellers.mobronix.internal`
  let userEmail = email

  try {
    // Check if profile already exists for this phone number
    const { data: profile, error: profileErr } = await serviceClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('phone', body.mobile)
      .maybeSingle()

    if (profileErr) {
      console.error('[otp/verify] profile lookup error')
    }

    if (profile) {
      userEmail = profile.email || email
      // Existing user: update password so we can sign them in next
      const { error: updateErr } = await serviceClient.auth.admin.updateUserById(profile.id, {
        password,
        user_metadata: { full_name: body.name || undefined }
      })
      if (updateErr) throw updateErr
    } else {
      // New user: create a genuine auth user
      const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
        email,
        phone: body.mobile,
        password,
        email_confirm: true,
        user_metadata: { full_name: body.name || 'Seller', phone: body.mobile }
      })
      if (createErr) {
        // If they already exist in auth.users but not in profiles, try updating by email instead
        if (createErr.message.includes('already exists')) {
          // Find user to get ID and update password
          const { data: list, error: listErr } = await serviceClient.auth.admin.listUsers()
          if (listErr) throw listErr
          const existing = list?.users?.find(u => u.email === email || u.phone === body.mobile)
          if (existing) {
            userEmail = existing.email || email
            const { error: updateErr } = await serviceClient.auth.admin.updateUserById(existing.id, {
              password,
              user_metadata: { full_name: body.name || undefined }
            })
            if (updateErr) throw updateErr

            const { error: profileCreateErr } = await serviceClient
              .from('profiles')
              .upsert({
                id: existing.id,
                full_name: body.name || existing.user_metadata?.full_name || 'Seller',
                phone: body.mobile,
                email: userEmail,
                role: 'customer',
              }, { onConflict: 'id' })
            if (profileCreateErr) throw profileCreateErr
          } else {
            throw createErr
          }
        } else {
          throw createErr
        }
      }
    }

    // 3. Adopt session on the client/route side (sets the cookies)
    const { data: signInData, error: signInError } = await routeClient.auth.signInWithPassword({
      email: userEmail,
      password
    })

    if (signInError) {
      console.error('[otp/verify] signInWithPassword error', signInError)
      return NextResponse.json({ error: signInError.message }, { status: 400 })
    }

    // Fetch profile role to return the correct user role instantly
    const { data: profileRole } = await serviceClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', signInData.user.id)
      .single()
    const role = profileRole?.role === 'admin' ? 'admin' : 'seller'

    const response = NextResponse.json({
      ok: true,
      session: signInData.session,
      user: {
        name: profileRole?.full_name || signInData.user?.user_metadata?.full_name || 'Seller',
        mobile: body.mobile,
        role
      }
    })
    response.cookies.set(AUTH_ACTIVITY_COOKIE, String(Date.now()), authCookieOptions)
    return response

  } catch (error: any) {
    console.error('[otp/verify] user sync failed')
    return NextResponse.json({ error: error.message || 'Verification succeeded, but login synchronization failed.' }, { status: 500 })
  }
}
