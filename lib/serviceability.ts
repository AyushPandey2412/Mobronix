import type { SupabaseClient } from '@supabase/supabase-js'

export class ServiceabilityError extends Error {
  constructor(message: string, public readonly status = 400) { super(message) }
}

export async function checkServiceability(db: SupabaseClient, pincode: string) {
  if (!/^[1-9]\d{5}$/.test(pincode)) {
    throw new ServiceabilityError('Please enter a valid 6-digit pincode.')
  }
  const { data, error } = await db.from('serviceable_areas')
    .select('is_active').eq('pincode', pincode).maybeSingle()
  if (error) throw new ServiceabilityError('We could not check pickup availability. Please try again shortly.', 503)
  return {
    serviceable: data?.is_active === true,
    message: data?.is_active ? 'Pickup is available in your area.' : data
      ? 'Pickup is temporarily unavailable in your area. Please try again later.'
      : 'We don’t offer pickup in this area yet. We hope to reach you soon.',
  }
}

export async function requireServiceablePincode(db: SupabaseClient, pincode: string) {
  const result = await checkServiceability(db, pincode)
  if (!result.serviceable) throw new ServiceabilityError(result.message)
}
