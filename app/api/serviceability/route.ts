import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkServiceability, ServiceabilityError } from '@/lib/serviceability'

export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  try {
    return NextResponse.json(await checkServiceability(createServiceClient(), new URL(req.url).searchParams.get('pincode') || ''), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to check availability.' }, { status: error instanceof ServiceabilityError ? error.status : 503 })
  }
}
