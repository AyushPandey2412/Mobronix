/**
 * adminQueries.ts
 *
 * Central home for every TanStack Query key, queryFn, and mutationFn
 * used across the admin panel. Keeps components thin — they just call
 * useQuery / useMutation with these helpers.
 *
 * Query keys follow the pattern:
 *   ['enquiries']          — all enquiries
 *   ['enquiry', id]        — single enquiry
 *   ['enquiry-history', id]— history for one enquiry
 *   ['models']             — all models
 *   ['questions']          — all questions
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Enquiry, EnquiryHistory, EnquiryStatus, Model, Question } from './types'

// ─── Query keys ─────────────────────────────────────────────────────────────

export const QK = {
  enquiries:       () => ['enquiries'] as const,
  enquiry:         (id: string) => ['enquiry', id] as const,
  enquiryHistory:  (id: string) => ['enquiry-history', id] as const,
  models:          () => ['models'] as const,
  questions:       () => ['questions'] as const,
}

// ─── Query functions (return data, throw on error) ───────────────────────────

export async function fetchEnquiries(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('enquiries')
    .select('*, profiles(full_name, phone)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as any[]).map(e => ({ ...e, profile: e.profiles })) as Enquiry[]
}

export async function fetchEnquiry(sb: SupabaseClient, id: string) {
  const { data, error } = await sb
    .from('enquiries')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single()
  if (error) throw error
  return { ...(data as any), profile: (data as any).profiles } as Enquiry
}

export async function fetchEnquiryHistory(sb: SupabaseClient, id: string) {
  const { data, error } = await sb
    .from('enquiry_history')
    .select('*')
    .eq('enquiry_id', id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as EnquiryHistory[]
}

export async function fetchModels(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('models')
    .select('*')
    .order('category')
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as Model[]
}

export async function fetchQuestions(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('questions')
    .select('*')
    .order('order_index')
  if (error) throw error
  return (data ?? []) as Question[]
}

// ─── Mutation functions (called by useMutation) ──────────────────────────────

export async function updateEnquiryStatus(
  sb: SupabaseClient,
  { id, status, note }: { id: string; status: EnquiryStatus; step?: number; note: string }
) {
  const res = await fetch('/api/enquiry/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, note }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Status update failed')
  }
  return res.json()
}

export async function addEnquiryHistory(
  sb: SupabaseClient,
  { enquiryId, actor, action }: { enquiryId: string; actor: string; action: string }
) {
  const { error } = await sb
    .from('enquiry_history')
    .insert({ enquiry_id: enquiryId, actor, action })
  if (error) throw error
}

export async function deleteEnquiry(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('enquiries').delete().eq('id', id)
  if (error) throw error
}

export async function bulkUpdateEnquiryStatus(
  sb: SupabaseClient,
  { ids, status }: { ids: string[]; status: EnquiryStatus }
) {
  await Promise.all(ids.map((id) => updateEnquiryStatus(sb, { id, status, note: '' })))
}

export async function bulkDeleteEnquiries(sb: SupabaseClient, ids: string[]) {
  const { error } = await sb.from('enquiries').delete().in('id', ids)
  if (error) throw error
}

export async function upsertModel(
  sb: SupabaseClient,
  { payload, existingId }: { payload: Omit<Model, 'id' | 'created_at' | 'updated_at'>; existingId?: string }
) {
  if (existingId) {
    const { data, error } = await sb.from('models').update(payload).eq('id', existingId).select('*').single()
    if (error) throw error
    return data as Model
  }
  const { data, error } = await sb.from('models').insert(payload).select('*').single()
  if (error) throw error
  return data as Model
}

export async function patchModel(
  sb: SupabaseClient,
  { id, patch }: { id: string; patch: Partial<Model> }
) {
  const { error } = await sb.from('models').update(patch).eq('id', id)
  if (error) throw error
}

export async function upsertQuestion(
  sb: SupabaseClient,
  { payload, existingId }: { payload: any; existingId?: string }
) {
  if (existingId) {
    const { data, error } = await sb.from('questions').update(payload).eq('id', existingId).select('*').single()
    if (error) throw error
    return data as Question
  }
  const { data, error } = await sb.from('questions').insert(payload).select('*').single()
  if (error) throw error
  return data as Question
}

export async function patchQuestion(
  sb: SupabaseClient,
  { id, patch }: { id: string; patch: Partial<Question> }
) {
  const { error } = await sb.from('questions').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('questions').delete().eq('id', id)
  if (error) throw error
}

// ─── Public sell-flow queries (used by ModelSelector + condition page) ────────

export const QK_PUBLIC = {
  models:    () => ['public-models']    as const,
  questions: () => ['public-questions'] as const,
}

export async function fetchPublicModels(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('models')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as Model[]
}

export async function fetchPublicQuestions(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('questions')
    .select('*')
    .eq('is_active', true)
    .order('order_index')
  if (error) throw error
  return (data ?? []).map(normalizeQuestion) as Question[]
}

/**
 * Supabase stores condition questions with the columns question_text / hint_text /
 * options / matrix_items / exclusive_option, while the sell-flow UI (QuestionBody)
 * reads the local shape q / sub / opts / items / exclusive. This bridges the two
 * so questions render identically whether they come from Supabase or local seed data.
 */
function normalizeQuestion(row: any): Question {
  return {
    ...row,
    q:         row.q ?? row.question_text,
    sub:       row.sub ?? row.hint_text ?? undefined,
    opts:      row.opts ?? row.options ?? undefined,
    items:     row.items ?? row.matrix_items ?? undefined,
    exclusive: row.exclusive ?? row.exclusive_option ?? undefined,
  }
}
