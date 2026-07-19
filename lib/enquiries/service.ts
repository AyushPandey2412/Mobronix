import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'
import { ENQUIRY_STATUS_STEPS, normalizeLegacyStatus, statusLabel } from '@/lib/enquiryStatus'
import { whatsappNotificationService } from '@/lib/whatsapp/service'
import type { Enquiry, EnquiryDevice, EnquiryStatus } from '@/lib/types'

const EXECS = ['Rohan Patil', 'Amit Sharma', 'Sana Khan', 'Vikram Iyer', 'Neha Desai']

const deviceSchema = z.object({
  model: z.string(),
  category: z.enum(['iphone', 'macbook', 'android']).optional().default('iphone'),
  variant: z.string().optional(),
  chip: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string(),
  base: z.number(),
  final: z.number(),
  factors: z.array(z.object({ label: z.string(), factor: z.number() })).optional().default([]),
  answers: z.record(z.any()).optional().default({}),
  responses: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
})

export const createEnquirySchema = z.object({
  devices: z.array(deviceSchema).min(1),
  address: z.string().min(3).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  pickup_slot: z.string().min(1).optional(),
  payment_mode: z.enum(['UPI', 'Cash']).optional(),
  photos: z.array(z.object({ slot: z.string(), path: z.string() })).optional().default([]),
  name: z.string().optional(),
  mobile: z.string().optional(),
})

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    'new',
    'contacted',
    'pickup_scheduled',
    'inspection',
    'price_confirmed',
    'payment_completed',
    'completed',
    'cancelled',
  ]),
  note: z.string().optional().default(''),
})

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

interface CreateContext {
  userId: string | null
  userEmail: string | null
}

function deviceLabel(devices: EnquiryDevice[]) {
  return devices
    .map((d) => [d.model, d.variant, d.chip, d.storage].filter(Boolean).join(' '))
    .join(', ')
}

async function validateDevicePrices(supabase: SupabaseClient, devices: EnquiryDevice[]) {
  const { data: dbModels, error } = await supabase.from('models').select('name, storages')
  if (error) throw new Error(error.message)

  const baseFor = (name: string, storage: string): number | null => {
    const model = (dbModels ?? []).find((x: any) => String(x.name).toLowerCase() === String(name).toLowerCase())
    if (!model) return null
    const storages = (model.storages ?? {}) as Record<string, unknown>
    const direct = storages[storage]
    if (typeof direct === 'number') return direct
    for (const tier of Object.values(storages)) {
      if (tier && typeof tier === 'object' && storage in (tier as object)) {
        const price = (tier as Record<string, number>)[storage]
        if (typeof price === 'number') return price
      }
    }
    return null
  }

  for (const device of devices) {
    if (device.category === 'android') continue
    if (!Number.isFinite(device.final) || device.final <= 0) {
      throw new Error('Invalid device price')
    }
    const dbBase = baseFor(device.model, device.storage)
    if (dbBase && (device.final < dbBase * 0.05 || device.final > dbBase * 1.2)) {
      throw new Error('Price mismatch - please refresh your quote and try again.')
    }
  }
}

export class EnquiryService {
  constructor(
    private readonly supabase: SupabaseClient = createServiceClient(),
    private readonly notifications = whatsappNotificationService
  ) {}

  async create(input: CreateEnquiryInput, context: CreateContext) {
    const devices = input.devices as EnquiryDevice[]
    await validateDevicePrices(this.supabase, devices)

    const total = devices.reduce((sum, device) => sum + device.final, 0)
    const assignedExec = EXECS[Math.floor(Math.random() * EXECS.length)]
    const baseRow = {
      user_id: context.userId,
      devices,
      total_amount: total,
      address: input.address || 'To be collected by phone',
      pincode: input.pincode || '000000',
      pickup_slot: input.pickup_slot || 'To be collected by phone',
      payment_mode: input.payment_mode || 'Cash',
      assigned_exec: assignedExec,
      status: 'new' satisfies EnquiryStatus,
      tracking_step: ENQUIRY_STATUS_STEPS.new,
    }

    let { data: inserted, error: insertError } = await this.supabase
      .from('enquiries')
      .insert({ ...baseRow, guest_name: input.name ?? null, guest_phone: input.mobile ?? null })
      .select('*, profiles(full_name, phone, email)')
      .single()

    if (insertError && (insertError.code === '42703' || /guest_(name|phone)/.test(insertError.message ?? ''))) {
      console.warn('[enquiries] guest contact columns missing - run migration 007. Inserting without them.')
      ;({ data: inserted, error: insertError } = await this.supabase
        .from('enquiries')
        .insert(baseRow)
        .select('*, profiles(full_name, phone, email)')
        .single())
    }

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Could not create enquiry')
    }

    const enquiry = { ...(inserted as any), profile: (inserted as any).profiles } as Enquiry

    if (input.photos.length) {
      const { error } = await this.supabase.from('enquiry_photos').insert(
        input.photos.map((photo) => ({ enquiry_id: enquiry.id, slot: photo.slot, storage_path: photo.path }))
      )
      if (error) console.error('[enquiries] photo insert failed', error)
    }

    await this.addHistory(enquiry.id, 'customer', `Enquiry submitted for ${deviceLabel(devices)}`)

    const ownerResult = await this.notifications.notifyOwner(this.supabase, {
      ...enquiry,
      guest_name: input.name ?? enquiry.guest_name,
      guest_phone: input.mobile ?? enquiry.guest_phone,
      profile: { ...(enquiry.profile ?? { full_name: null, phone: null }), email: context.userEmail },
    })
    if (!ownerResult.ok) console.error('[enquiries] owner WhatsApp failed', ownerResult.error)

    return {
      enquiry,
      assignedExec,
    }
  }

  async updateStatus(input: UpdateStatusInput, actorId?: string) {
    const { data: current, error: fetchError } = await this.supabase
      .from('enquiries')
      .select('*, profiles(full_name, phone, email)')
      .eq('id', input.id)
      .single()
    if (fetchError || !current) throw new Error(fetchError?.message || 'Enquiry not found')

    const previousStatus = normalizeLegacyStatus((current as any).status)
    const nextStatus = input.status
    const nextStep = ENQUIRY_STATUS_STEPS[nextStatus]
    const note = input.note?.trim() || null

    if (previousStatus === nextStatus && (current as any).internal_note === note) {
      return { enquiry: { ...(current as any), profile: (current as any).profiles } as Enquiry, changed: false }
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('enquiries')
      .update({ status: nextStatus, tracking_step: nextStep, internal_note: note })
      .eq('id', input.id)
      .select('*, profiles(full_name, phone, email)')
      .single()
    if (updateError || !updated) throw new Error(updateError?.message || 'Could not update enquiry')

    const enquiry = { ...(updated as any), profile: (updated as any).profiles } as Enquiry
    await this.addHistory(
      enquiry.id,
      'admin',
      `Status changed from ${statusLabel(previousStatus)} to ${statusLabel(nextStatus)}${actorId ? ` by ${actorId}` : ''}`
    )

    const customerResult = await this.notifications.notifyCustomer(this.supabase, enquiry, nextStatus)
    if (!customerResult.ok) {
      console.error('[enquiries] customer WhatsApp failed', customerResult.error)
      await this.addHistory(enquiry.id, 'admin', `Customer WhatsApp failed for ${statusLabel(nextStatus)}: ${customerResult.error}`)
    }

    return { enquiry, changed: true, notification: customerResult }
  }

  private async addHistory(enquiryId: string, actor: 'customer' | 'admin', action: string) {
    const { error } = await this.supabase.from('enquiry_history').insert({ enquiry_id: enquiryId, actor, action })
    if (error) console.error('[enquiries] history insert failed', error)
  }
}

export function createEnquiryService() {
  return new EnquiryService()
}
