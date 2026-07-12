// lib/pricing.ts
// CORE BUSINESS RULES. This is the ONLY place the multiplication/rounding logic lives.
// Implemented exactly per the master prompt.

import type { Model, Question, QuizAnswers, MatrixAnswer } from './types'

/**
 * Base price lookup — handles both iPhone (flat) and MacBook (nested by chip).
 *   iPhone:  { "128GB": 25000, "256GB": 29000 }
 *   MacBook: { "M1": { "256GB": 62000, "512GB": 75000 } }
 */
export function getBasePrice(model: Model, storage: string, chip?: string): number {
  if (model.category === 'macbook' && chip) {
    const chipPrices = (model.storages as Record<string, Record<string, number>>)[chip]
    if (!chipPrices) throw new Error(`No prices found for chip ${chip}`)
    const price = chipPrices[storage]
    if (price === undefined) throw new Error(`No price for ${chip} / ${storage}`)
    return price
  }
  // Flat format (iPhone)
  const price = (model.storages as Record<string, number>)[storage]
  if (price === undefined) throw new Error(`No price for storage ${storage}`)
  return price
}

export interface QuoteResult {
  finalPrice: number
  breakdown: { label: string; factor: number }[]
}

/**
 * final_price = round_to_nearest_100( base_price × Π(all applicable factors) )
 * Only factors that differ from 1.00 are recorded in the breakdown.
 */
export function calcQuote(
  basePrice: number,
  questions: Question[],
  answers: QuizAnswers
): QuoteResult {
  let composite = 1
  const breakdown: { label: string; factor: number }[] = []

  for (const q of questions) {
    const answer = q.id ? answers[q.id] : undefined
    if (answer === undefined) continue

    if (q.type === 'single') {
      const opt = q.options?.find((o) => o.label === answer)
      if (opt && opt.factor !== 1) {
        composite *= opt.factor
        breakdown.push({ label: opt.label, factor: opt.factor })
      }
    } else if (q.type === 'multi') {
      const selected = answer as string[]
      for (const label of selected) {
        const opt = q.options?.find((o) => o.label === label)
        if (opt && opt.factor !== 1) {
          composite *= opt.factor
          breakdown.push({ label: opt.label, factor: opt.factor })
        }
      }
    } else if (q.type === 'matrix') {
      const matrixAns = answer as MatrixAnswer
      for (const item of q.matrix_items ?? []) {
        const choice = matrixAns[item.label]
        if (choice === undefined) continue
        const factor = choice === 'yes' ? item.yesFactor : item.noFactor
        if (factor !== 1) {
          breakdown.push({ label: item.label, factor })
          composite *= factor
        }
      }
    }
  }

  const raw = basePrice * composite
  const finalPrice = Math.round(raw / 100) * 100
  return { finalPrice, breakdown }
}

/** Format a factor as a human delta string, e.g. 0.88 -> "−12%", 1.03 -> "+3%". */
export function formatFactorDelta(factor: number): string {
  const pct = Math.round((factor - 1) * 100)
  if (pct === 0) return '0%'
  return pct > 0 ? `+${pct}%` : `−${Math.abs(pct)}%`
}

/** Highest price across all storage tiers (used for "Get Upto ₹X"). */
export function getMaxPrice(model: Model): number {
  const s = model.storages
  const values: number[] = []
  for (const v of Object.values(s)) {
    if (typeof v === 'number') values.push(v)
    else values.push(...Object.values(v as Record<string, number>))
  }
  return values.length ? Math.max(...values) : 0
}

/** Format INR with grouping, no decimals, e.g. 89000 -> "₹89,000". */
export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}
