"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { QuestionBody, canProceed } from "@/components/sell/QuestionBody";
import { useStore, useActiveModel } from "@/lib/store";
import { QUESTIONS, MAC_QUESTIONS } from "@/lib/data";
import { QK_PUBLIC, fetchPublicQuestions } from "@/lib/adminQueries";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Answer } from "@/lib/types";

export default function ConditionPage() {
  const router          = useRouter();
  const model           = useActiveModel();
  const selectedStorage = useStore((s) => s.selectedStorage);
  const answers         = useStore((s) => s.answers);
  const setAnswer       = useStore((s) => s.setAnswer);
  const computeQuote    = useStore((s) => s.computeQuote);

  const [index, setIndex] = useState(0);

  const sb = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    if (!model) router.replace("/");
  }, [model, router]);

  // Fetch live questions from Supabase for the right category
  const { data: supabaseQuestions, isLoading } = useQuery({
    queryKey: QK_PUBLIC.questions(),
    queryFn:  () => fetchPublicQuestions(sb),
    staleTime: 5 * 60 * 1000,
    enabled:  !!model,
  });

  // Pick questions: Supabase first, fallback to local data
  const questions = useMemo(() => {
    const isMac = model?.category === "macbook";
    if (supabaseQuestions && supabaseQuestions.length > 0) {
      return supabaseQuestions.filter(
        (q) => q.category === (isMac ? "macbook" : "iphone") || q.category === "all"
      );
    }
    return isMac ? MAC_QUESTIONS : QUESTIONS;
  }, [supabaseQuestions, model?.category]);

  // Keep the store's copy in sync so computeQuote() prices against the exact
  // questions shown here (Supabase and local sets differ in order + content).
  useEffect(() => {
    useStore.setState({ activeQuestions: questions });
  }, [questions]);

  if (!model) return null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pt-4">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-8 w-3/4 mt-6" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const total    = questions.length;
  const question = questions[index];
  const answer   = answers[index] as Answer | undefined;
  const proceed  = question ? canProceed(question, answer) : false;
  const isLast   = index === total - 1;

  const next = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      computeQuote();
      router.push("/sell/quote");
    }
  };

  const back = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/sell/storage");
    }
  };

  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <FlowHeader title={`${model.name} · ${selectedStorage}`} onBack={back} />

      <div className="pt-2">
        <Progress value={(index / total) * 100} label={`Question ${index + 1} of ${total}`} />
      </div>

        <div
          key={index}
          className="pt-8 animate-m-slide-right"
        >
          <h1 className="text-h3 font-extrabold tracking-tight text-text-primary text-balance">
            {question.q ?? question.question_text}
          </h1>
          <p className="mt-1.5 text-body-sm text-text-tertiary">
            {question.sub ?? question.hint_text}
          </p>
          <div className="mt-6">
            <QuestionBody
              question={question}
              answer={answer}
              onAnswer={(a) => setAnswer(index, a)}
            />
          </div>
        </div>

      <div className="mt-8 flex items-center justify-between gap-4 pb-10">
        {index > 0 && (
          <Button variant="outline" onClick={back}>
            Back
          </Button>
        )}
        <Button
          className="ml-auto"
          onClick={next}
          disabled={!proceed}
          rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
        >
          {isLast ? "See my quote" : "Next"}
        </Button>
      </div>
    </div>
  );
}
