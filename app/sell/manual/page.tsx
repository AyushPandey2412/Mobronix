"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QuestionBody, canProceed } from "@/components/sell/QuestionBody";
import { useStore } from "@/lib/store";
import { QUESTIONS } from "@/lib/data";
import { toast } from "@/lib/toast";
import type { Answer } from "@/lib/types";

function ManualSellContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brand = searchParams.get("brand") || "Other";

  // Wizard steps: 1 = Details, 2 = Questions
  const [step, setStep] = useState(1);

  // Step 1 states
  const [modelName, setModelName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [storageName, setStorageName] = useState("");

  // Step 2 states (13 condition questions)
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  const questions = QUESTIONS; // 13 standard questions
  const currentQuestion = questions[qIndex];
  const currentAnswer = answers[qIndex];
  const canProceedQuestion = currentQuestion ? canProceed(currentQuestion, currentAnswer) : false;

  const totalQuestions = questions.length;

  const handleNextStep1 = () => {
    if (!modelName.trim()) {
      toast("Please enter your device model name", "error");
      return;
    }
    setStep(2);
  };

  const handleNextQuestion = () => {
    if (qIndex < totalQuestions - 1) {
      setQIndex(qIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Complete: sync with store and redirect to standard checkout
      const manualModel = {
        id: "manual-android",
        name: `${brand} ${modelName}`,
        category: "android" as const,
        series: brand,
        storages: { [storageName || "To be collected"]: 0 }
      };

      // Add to store and select it
      useStore.setState({
        models: [manualModel, ...useStore.getState().models.filter(m => m.id !== "manual-android")],
        selectedModelId: "manual-android",
        selectedStorage: storageName || "To be collected",
        answers: answers,
        activeQuestions: QUESTIONS,
        quote: { base: 0, final: 0, breakdown: [] }
      });

      toast("Details saved. Please schedule your pickup.", "success");
      router.push("/sell/checkout");
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    } else if (step === 2) {
      if (qIndex > 0) {
        setQIndex(qIndex - 1);
      } else {
        setStep(1);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl min-h-[60vh] flex flex-col justify-between">
      <div>
        <FlowHeader
          title={`Sell your ${brand}`}
          onBack={handleBack}
        />

        {step === 1 && (
          <div className="mt-6 space-y-5 animate-m-fade-up">
            <div>
              <h2 className="text-h4 font-bold text-text-primary">Device Details</h2>
              <p className="text-body-sm text-text-secondary mt-1">
                Tell us about your {brand} device. You will schedule a pickup at checkout, and a spokesperson will call you with a price quote.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Model name"
                placeholder="e.g. Galaxy S24 Ultra, OnePlus 12"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />
              <Input
                label="Storage capacity (optional)"
                placeholder="e.g. 128GB, 256GB, 512GB"
                value={storageName}
                onChange={(e) => setStorageName(e.target.value)}
              />
              <Input
                label="Variant / RAM (optional)"
                placeholder="e.g. 12GB RAM, Custom Color"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
              />
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleNextStep1}
              rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
            >
              Continue to Condition Check
            </Button>
          </div>
        )}

        {step === 2 && currentQuestion && (
          <div className="mt-4">
            <Progress
              value={(qIndex / totalQuestions) * 100}
              label={`Question ${qIndex + 1} of ${totalQuestions}`}
            />

            <div key={qIndex} className="pt-8 animate-m-slide-right">
              <h1 className="text-h3 font-extrabold tracking-tight text-text-primary text-balance">
                {currentQuestion.q ?? currentQuestion.question_text}
              </h1>
              <p className="mt-1.5 text-body-sm text-text-tertiary">
                {currentQuestion.sub ?? currentQuestion.hint_text}
              </p>
              <div className="mt-6">
                <QuestionBody
                  question={currentQuestion}
                  answer={currentAnswer}
                  onAnswer={(a) => setAnswers({ ...answers, [qIndex]: a })}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 pb-10">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                className="ml-auto"
                onClick={handleNextQuestion}
                disabled={!canProceedQuestion}
                rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
              >
                {qIndex === totalQuestions - 1 ? "Go to Checkout" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManualSellPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-body-sm text-text-tertiary">Loading flow...</div>}>
      <ManualSellContent />
    </Suspense>
  );
}
