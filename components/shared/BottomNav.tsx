"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SELL_PATHS = ["/sell", "/cart"];

export function BottomNav() {
  const pathname     = usePathname();
  const enquiry      = useStore((s) => s.enquiry);
  const lastSeenStep = useStore((s) => s.lastSeenStep);
  const hasUpdate    = !!enquiry && enquiry.step > lastSeenStep;

  const items = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      match: (p: string) => p === "/" || SELL_PATHS.some((s) => p.startsWith(s)),
    },
    {
      href: "/track",
      label: "Orders",
      icon: ClipboardList,
      match: (p: string) => p.startsWith("/track"),
      badge: hasUpdate,
    },
    {
      href: "/account",
      label: "Account",
      icon: UserIcon,
      match: (p: string) => p.startsWith("/account"),
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-sticky md:hidden"
    >
      <div className="border-t border-border/60 bg-surface/95 backdrop-blur-xl px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center">
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon   = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center gap-[3px] py-2.5 active:opacity-50"
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-[21px] w-[21px] transition-all duration-200",
                      active ? "text-brand" : "text-text-disabled"
                    )}
                    strokeWidth={active ? 2 : 1.6}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.12 : 0}
                  />

                  {item.badge && (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full border-2 border-surface bg-error-500" />
                  )}
                </span>

                <span
                  className={cn(
                    "text-[10px] leading-none tracking-tight transition-colors duration-200",
                    active ? "font-semibold text-brand" : "font-medium text-text-tertiary"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}