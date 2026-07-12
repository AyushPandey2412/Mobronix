"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Home } from "lucide-react";
import { OrderCard } from "@/components/track/OrderCard";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export default function ConfirmPage() {
  const router = useRouter();
  const enquiry = useStore((s) => s.enquiry);

  useEffect(() => {
    if (!enquiry) router.replace("/");
  }, [enquiry, router]);

  if (!enquiry) return null;

  return (
    <div className="flex min-h-[68vh] flex-col items-center justify-center py-8">
      <div className="w-full max-w-md text-center">
        <span
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success-100 text-success-600 animate-m-pop"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </span>

        <h1
          className="mt-6 text-h2 font-extrabold tracking-tight text-text-primary animate-m-fade-up"
        >
          Request submitted!
        </h1>
        <p
          className="mx-auto mt-2 max-w-sm text-body-md text-text-secondary animate-m-fade-up"
        >
          Thank you! {enquiry.exec ? <b className="text-text-primary">{enquiry.exec}</b> : "Our spokesperson"} from our
          team will call you shortly to verify your device and confirm the final price &amp; pickup slot.
        </p>

        <div
          className="mt-8 text-left animate-m-fade-up"
        >
          <OrderCard order={enquiry} />
        </div>

        <div
          className="mt-6 flex flex-col gap-3 animate-m-fade"
        >
          <Button size="lg" onClick={() => router.push("/track")} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
            View full tracking
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/")} leftIcon={<Home className="h-[18px] w-[18px]" />}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
