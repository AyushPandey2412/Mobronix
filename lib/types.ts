/**
 * lib/types.ts — unified types for SellMyiPhone.
 * P1 types power the Zustand store + frontend UI.
 * P2 types power the Supabase backend (API routes, email, admin).
 */

// ─── Shared enums ─────────────────────────────────────────────────
export type ModelCategory    = 'iphone' | 'macbook'
export type QuestionCategory = 'iphone' | 'macbook' | 'all'
export type QuestionType     = 'single' | 'multi' | 'matrix'

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'pickup_scheduled'
  | 'inspection'
  | 'price_confirmed'
  | 'payment_completed'
  | 'completed'
  | 'cancelled'

export type PaymentMode = 'UPI' | 'Cash'

// ─── P1 local types (Zustand store + frontend) ───────────────────

export interface Model {
  id:       string
  slug?:    string
  name:     string
  series:   string
  category?: ModelCategory
  variants?: ModelVariant[] | null
  chips?:   string[] | null
  rams?:    string[] | null
  storages: Record<string, number> | Record<string, Record<string, number>>
  is_active?: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface ModelVariant {
  label:       string
  slug_suffix: string
}

export type FlatStorages   = Record<string, number>
export type NestedStorages = Record<string, Record<string, number>>

export type QuestionOption = {
  label:  string
  factor: number
}

export type MatrixItem = {
  label:     string
  yesFactor: number
  noFactor:  number
}

export interface Question {
  // P1 fields
  type:      QuestionType
  q?:        string
  sub?:      string
  opts?:     QuestionOption[]
  items?:    MatrixItem[]
  exclusive?: string
  // P2 fields
  id?:               string
  order_index?:      number
  category?:         QuestionCategory
  question_text?:    string
  hint_text?:        string | null
  exclusive_option?: string | null
  options?:          QuestionOption[] | null
  matrix_items?:     MatrixItem[] | null
  is_active?:        boolean
  created_at?:       string
  updated_at?:       string
}

/** Per-slot photo state stored in Zustand */
export interface PhotoState {
  done: boolean
  /** Supabase Storage path after upload, e.g. "guest/front.jpg" */
  path: string | null
  /** Local blob URL for preview (browser only, not persisted) */
  preview?: string
}

export interface PhotoSlot {
  id:    string
  label: string
  hint:  string
}

export type Answer    = number | number[] | Record<number, 'yes' | 'no'>
export type AnswerMap = Record<number, Answer>

// P2 answer types
export type SingleAnswer = string
export type MultiAnswer  = string[]
export type MatrixAnswer = Record<string, 'yes' | 'no'>
export type QuizAnswers  = Record<string, SingleAnswer | MultiAnswer | MatrixAnswer>

export interface QuoteBreakdownItem {
  label:  string
  val:    string
  factor: number
}

export interface Quote {
  base:      number
  final:     number
  breakdown: QuoteBreakdownItem[]
}

export interface CartDevice {
  modelId:   string
  model:     string
  storage:   string
  base:      number
  final:     number
  breakdown: QuoteBreakdownItem[]
  answers:   AnswerMap
}

export interface DeviceLine {
  model:   string
  storage: string
  final:   number
}

export interface HistoryEntry {
  ts:     string
  action: string
}

export interface User {
  name:   string
  mobile: string
  role:   'seller' | 'admin'
}

export interface Review {
  id?:          string
  name:         string
  city:         string
  rating:       number
  text?:        string
  review_text?: string
  is_published?: boolean
}

/** P1 local Enquiry (Zustand store) */
export interface Enquiry {
  id:        string
  name:      string
  mobile:    string
  model:     string
  storage:   string
  devices?:  DeviceLine[] | EnquiryDevice[]
  amount:    number
  address:   string
  pincode:   string
  slot:      string
  pay:       PaymentMode | string
  step:      number
  status:    EnquiryStatus
  note:      string
  createdAt: string
  answers?:  AnswerMap
  exec?:     string
  rating?:   number | null
  history:   HistoryEntry[]
  // P2 Supabase fields (optional)
  display_id?:    string
  user_id?:       string | null
  total_amount?:  number
  tracking_step?: number
  assigned_exec?: string | null
  internal_note?: string | null
  pickup_slot?:   string
  payment_mode?:  PaymentMode
  created_at?:    string
  updated_at?:    string
  /** Guest contact (captured at checkout when there is no authenticated profile). */
  guest_name?:    string | null
  guest_phone?:   string | null
  profile?:       { full_name: string | null; phone: string | null; email?: string | null } | null
}

// ─── P2 Supabase types (backend API routes + admin) ──────────────

export interface Profile {
  id:         string
  full_name:  string | null
  phone:      string | null
  email?:     string | null
  role:       'customer' | 'admin'
  created_at: string
}

export interface EnquiryDevice {
  model:     string
  category:  ModelCategory
  variant?:  string
  chip?:     string
  ram?:      string
  storage:   string
  base:      number
  final:     number
  factors:   { label: string; factor: number }[]
  answers:   QuizAnswers
}

export interface EnquiryHistory {
  id:         string
  enquiry_id: string
  actor:      'customer' | 'admin'
  action:     string
  created_at: string
}

export interface EnquiryPhoto {
  id:           string
  enquiry_id:   string
  slot:         'front' | 'back' | 'settings' | 'left' | 'right'
  storage_path: string
  created_at:   string
}

// Canonical order-tracking stages — the SINGLE source of truth shown to BOTH the
// admin (when setting tracking_step) and the customer (track page / OrderCard).
// lib/data.ts `TRACK_STEPS` re-exports this so the numeric step never maps to two
// different labels. Keep these in sync with `TRACK_SHORT` in lib/data.ts.
export { TRACKING_STEPS } from './enquiryStatus'
