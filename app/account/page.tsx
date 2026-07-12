"use client";


import { useRouter } from "next/navigation";
import { Settings, Gift, LogOut, ChevronRight, Phone, BadgeCheck } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);

  if (!user) return null;

  const rows = [
    { icon: Settings, label: "Settings", sub: "Notifications, language", href: "/account/settings" },
    { icon: Gift, label: "Refer & Earn", sub: "Get ₹500 per referral", href: "/account/referral" },
  ];

  const doLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <>
      <FlowHeader title="Account" back="/" />

      <div
        className="mt-2 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 animate-m-fade-up"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-h4 font-bold text-white">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-h4 font-bold text-text-primary">{user.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-text-secondary">
            <Phone className="h-4 w-4" /> {user.mobile}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-caption font-bold text-success-700">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={() => router.push(r.href)}
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-brand">
              <r.icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-body-md font-semibold text-text-primary">{r.label}</span>
              <span className="block text-caption text-text-tertiary">{r.sub}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-text-tertiary" />
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="danger" size="lg" fullWidth onClick={doLogout} leftIcon={<LogOut className="h-[18px] w-[18px]" />}>
          Log out
        </Button>
      </div>
    </>
  );
}
