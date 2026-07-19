"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

/** Decides which global chrome (header / bottom nav / footer) to show per route. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isFlow = pathname.startsWith("/sell") || pathname === "/cart";

  // Admin & login render their own full-bleed chrome.
  if (isLogin || isAdmin) {
    return <>{children}</>;
  }

  const showFooter = !isFlow;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      {/* No bottom-nav padding during the sell/cart flow — those screens use their
          own full-width StickyBar action bar instead of the global bottom nav. */}
      <main className={cn("flex-1", isFlow ? "" : "pb-20 md:pb-0")}>{children}</main>
      {showFooter && <Footer />}
      {/* Hide the global bottom nav during the focused sell/cart flow so it doesn't
          collide with the flow's sticky "Continue" action bar. */}
      {!isFlow && <BottomNav />}
    </div>
  );
}
