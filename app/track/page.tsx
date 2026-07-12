"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, RefreshCw, Pencil, X, PackageSearch } from "lucide-react";
import { AuthGate } from "@/components/shared/AuthGate";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { OrderCard } from "@/components/track/OrderCard";
import { StatusTimeline } from "@/components/track/StatusTimeline";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { TRACK_STEPS } from "@/lib/data";
import { toast } from "@/lib/toast";

interface OrderLike {
  id: string;
  display_id?: string;
  model: string;
  storage: string;
  amount: number;
  step: number;
  exec?: string;
}

function TrackInner() {
  const router = useRouter();
  const enquiry = useStore((s) => s.enquiry);
  const startEditPickup = useStore((s) => s.startEditPickup);
  const cancelEnquiry = useStore((s) => s.cancelEnquiry);
  const rateEnquiry = useStore((s) => s.rateEnquiry);
  const patchCurrentEnquiry = useStore((s) => s.patchCurrentEnquiry);
  const markStepSeen = useStore((s) => s.markStepSeen);

  const [input, setInput] = useState("");
  const [searchResult, setSearchResult] = useState<OrderLike | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [refreshing, setRefreshing] = useState(false);

  // Mark current status as seen when viewing the page.
  useEffect(() => {
    markStepSeen();
  }, [markStepSeen, enquiry?.step]);

  const onEdit = () => {
    startEditPickup();
    router.push("/sell/checkout");
  };

  const onCancel = () => {
    if (confirm("Cancel this request? You can submit a new one anytime.")) {
      cancelEnquiry();
      toast("Request cancelled");
    }
  };

  // Look up any order's live status by ENQ number (or your own by mobile).
  const onSearch = async () => {
    const q = input.trim();
    if (!q) return;
    setSearchState("loading");

    // Match your own current enquiry locally first (by ENQ number, id or mobile).
    if (
      enquiry &&
      [enquiry.display_id, enquiry.id, enquiry.mobile].some(
        (v) => v && String(v).toLowerCase() === q.toLowerCase()
      )
    ) {
      setSearchResult(enquiry as unknown as OrderLike);
      setSearchState("found");
      return;
    }

    // Otherwise ask the server (works for any order by its ENQ number).
    try {
      const res = await fetch(`/api/enquiry/status?ref=${encodeURIComponent(q)}`);
      if (!res.ok) { setSearchResult(null); setSearchState("notfound"); return; }
      setSearchResult(await res.json());
      setSearchState("found");
    } catch {
      setSearchResult(null);
      setSearchState("notfound");
    }
  };

  // Re-fetch the REAL status from the server (no fake advancing).
  const onRefresh = async () => {
    const enq = useStore.getState().enquiry;
    if (!enq?.id) { toast("No active enquiry to refresh"); return; }
    setRefreshing(true);
    try {
      const res = await fetch(`/api/enquiry/status?id=${encodeURIComponent(enq.id)}`);
      if (!res.ok) { toast("Couldn't refresh status right now"); return; }
      const data = await res.json();
      patchCurrentEnquiry({ status: data.status, step: data.step });
      toast(`Status: ${TRACK_STEPS[data.step] ?? "updated"}`);
    } catch {
      toast("Couldn't refresh status right now");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container-app mx-auto max-w-2xl pb-24 pt-2 md:pb-12">
      <FlowHeader title="My Enquiry" back="/" />

      {/* Search */}
      <div className="mt-2 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-label text-text-primary">Track any order</h2>
        <p className="mt-1 text-body-sm text-text-secondary">Enter your Enquiry ID (e.g. ENQ-00012).</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            containerClassName="flex-1"
            placeholder="e.g. ENQ-00012"
            leftIcon={<Search className="h-[18px] w-[18px]" />}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <Button onClick={onSearch} isLoading={searchState === "loading"} className="sm:w-auto">
            Check status
          </Button>
        </div>

        {searchState === "notfound" && (
          <div className="mt-5 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-body-sm text-warning-800">
            No order found for “{input.trim()}”. Double-check your Enquiry ID (e.g. ENQ-00012).
          </div>
        )}

        {searchState === "found" && searchResult && (
          <div className="mt-5 space-y-4 animate-m-fade-up">
            <OrderCard order={searchResult} />
            <StatusTimeline step={searchResult.step} exec={searchResult.exec} />
          </div>
        )}
      </div>

      {/* Current enquiry */}
      <div className="mt-8">
        <h2 className="text-h4 font-bold text-text-primary">Current enquiry</h2>
        {enquiry ? (
          <>
            <p className="mt-0.5 text-body-sm text-text-secondary">Live status of your most recent request.</p>

            <div className="mt-4 space-y-4">
              <OrderCard order={enquiry} />

              <div className="flex items-center justify-between gap-3">
                {enquiry.status === "new" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
                      Edit pickup
                    </Button>
                    <Button size="sm" variant="danger" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>
                      Cancel
                    </Button>
                  </div>
                ) : enquiry.status === "cancelled" ? (
                  <span className="text-body-sm text-text-tertiary">This request was cancelled.</span>
                ) : (
                  <span />
                )}
                <Button size="sm" variant="ghost" onClick={onRefresh} isLoading={refreshing} leftIcon={<RefreshCw className="h-4 w-4" />}>
                  Refresh
                </Button>
              </div>

              <StatusTimeline step={enquiry.step} exec={enquiry.exec} />

              {enquiry.step >= TRACK_STEPS.length - 1 && (
                <div className="rounded-xl border border-border bg-surface p-5 text-center">
                  <h4 className="text-body-md font-bold text-text-primary">How was your experience?</h4>
                  <p className="mt-0.5 text-body-sm text-text-secondary">Rate the pickup and payment for {enquiry.id}</p>
                  <div className="mt-4 flex justify-center">
                    <Stars value={enquiry.rating ?? 0} onRate={(n) => rateEnquiry(n)} />
                  </div>
                  {enquiry.rating ? (
                    <p className="mt-3 text-body-sm font-semibold text-success-700">
                      Thanks for rating us {enquiry.rating} star{enquiry.rating > 1 ? "s" : ""}!
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                <MessageCircle className="h-5 w-5 text-whatsapp" />
                <p className="flex-1 text-body-sm text-text-secondary">Need help with this enquiry?</p>
                <button
                  onClick={() => toast("This opens WhatsApp chat on the live site.")}
                  className="text-body-sm font-bold text-brand"
                >
                  Chat with us
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<PackageSearch className="h-7 w-7" />}
            title="No active enquiry"
            description="Sell your iPhone to see its live status here."
            action={<Button onClick={() => router.push("/")}>Sell my iPhone</Button>}
          />
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <AuthGate>
      <TrackInner />
    </AuthGate>
  );
}
