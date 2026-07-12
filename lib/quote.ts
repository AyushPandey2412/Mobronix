import type { AnswerMap, Question, Quote, QuoteBreakdownItem } from "./types";

/**
 * Compute a quote from a base price + condition answers against a question set.
 * Mirrors the prototype pricing engine: base price × product of all condition
 * multipliers, rounded to the nearest ₹100.
 */
export function calcQuote(
  base: number,
  answers: AnswerMap,
  questions: Question[]
): Quote {
  let factor = 1;
  const breakdown: QuoteBreakdownItem[] = [];

  // A bad/empty factor from the DB (null → NaN) would turn the whole quote into
  // ₹NaN. Treat any non-finite factor as a neutral 1.0.
  const safe = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 1);

  questions.forEach((q, i) => {
    const ans = answers[i];
    if (ans === undefined || ans === null) return;

    if (q.type === "matrix" && q.items) {
      if (typeof ans !== "object" || Array.isArray(ans)) return;
      q.items.forEach((item, ii) => {
        const val = (ans as Record<number, "yes" | "no">)[ii];
        if (val === undefined) return;
        const f = safe(val === "yes" ? item.yesFactor : item.noFactor);
        factor *= f;
        if (f !== 1.0) {
          breakdown.push({ label: `${q.q} — ${item.label}`, val: val === "yes" ? "Yes" : "No", factor: f });
        }
      });
    } else if (q.type === "multi" && q.opts) {
      if (!Array.isArray(ans)) return;
      (ans as number[]).forEach((oi) => {
        const opt = q.opts![oi];
        if (!opt) return;
        const f = safe(opt.factor);
        factor *= f;
        if (f !== 1.0) {
          breakdown.push({ label: q.q ?? "", val: opt.label, factor: f });
        }
      });
    } else if (q.opts) {
      const opt = q.opts[ans as number];
      if (!opt) return;
      const f = safe(opt.factor);
      factor *= f;
      if (f !== 1.0) {
        breakdown.push({ label: q.q ?? "", val: opt.label, factor: f });
      }
    }
  });

  const final = Math.round((base * factor) / 100) * 100;
  return { base, final, breakdown };
}

/** A short headline grade for the quote, used for storytelling. */
export function quoteGrade(quote: Quote): { label: string; tone: "great" | "good" | "fair" } {
  if (quote.base === 0) return { label: "—", tone: "fair" };
  const ratio = quote.final / quote.base;
  if (ratio >= 0.95) return { label: "Excellent condition", tone: "great" };
  if (ratio >= 0.8) return { label: "Good condition", tone: "good" };
  return { label: "Fair condition", tone: "fair" };
}
