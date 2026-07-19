import { QUESTIONS, MAC_QUESTIONS } from "./data";
import type { AnswerMap, Question } from "./types";

export interface ResponseItem {
  question: string;
  answer: string;
}

export function getResponses(
  answers: AnswerMap,
  category: "iphone" | "macbook" | string = "iphone",
  activeQuestions?: Question[]
): ResponseItem[] {
  const questionsToUse = activeQuestions && activeQuestions.length > 0
    ? activeQuestions
    : (category === "macbook" ? MAC_QUESTIONS : QUESTIONS);
  
  const responses: ResponseItem[] = [];

  questionsToUse.forEach((q, i) => {
    const ans = answers[i];
    if (ans === undefined || ans === null) return;

    if (q.type === "matrix" && q.items) {
      if (typeof ans !== "object" || Array.isArray(ans)) return;
      q.items.forEach((item, ii) => {
        const val = (ans as Record<number, "yes" | "no">)[ii];
        if (val === undefined) return;
        responses.push({
          question: `${q.q ?? q.question_text} — ${item.label}`,
          answer: val === "yes" ? "Yes" : "No",
        });
      });
    } else if (q.type === "multi" && q.opts) {
      if (!Array.isArray(ans)) return;
      const labels = (ans as number[])
        .map((oi) => q.opts![oi]?.label)
        .filter(Boolean);
      responses.push({
        question: q.q ?? q.question_text ?? "",
        answer: labels.length > 0 ? labels.join(", ") : "None",
      });
    } else if (q.opts) {
      const opt = q.opts[ans as number];
      if (opt) {
        responses.push({
          question: q.q ?? q.question_text ?? "",
          answer: opt.label,
        });
      }
    }
  });

  return responses;
}
