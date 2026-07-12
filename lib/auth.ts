'use client'
// Client-side auth helpers wrapping the three providers.
import { createBrowserClient } from './supabase/client'

export async function signInWithGoogle(redirectTo: string) {
  const sb = createBrowserClient()
  return sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
}
export async function sendPhoneOtp(phone: string) {
  const sb = createBrowserClient()
  return sb.auth.signInWithOtp({ phone })
}
export async function verifyPhoneOtp(phone: string, token: string) {
  const sb = createBrowserClient()
  return sb.auth.verifyOtp({ phone, token, type: 'sms' })
}
export async function signInWithEmail(email: string, password: string) {
  const sb = createBrowserClient()
  return sb.auth.signInWithPassword({ email, password })
}
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const sb = createBrowserClient()
  return sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
}
