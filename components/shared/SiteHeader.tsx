"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, User as UserIcon } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Sell" },
  { href: "/#how", label: "How it works" },
  { href: "/track", label: "Track Order" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);

  // Scroll-spy: on the home page, highlight the nav item whose section is in
  // view. "" = top (Sell), "how" = How it works section.
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") { setActiveSection(""); return; }
    const el = document.getElementById("how");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActiveSection(entry.isIntersecting ? "how" : ""),
      // Treat the section as active once it reaches the upper-middle of the viewport.
      { rootMargin: "-45% 0px -50% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-header border-b border-border/70 bg-surface/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Mobronix home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const isHome = pathname === "/";
            let active: boolean;
            if (item.href.includes("#")) {
              // In-page anchor (e.g. "/#how") — active when its section is in view.
              const hash = item.href.split("#")[1];
              active = isHome && activeSection === hash;
            } else if (item.href === "/") {
              // "Sell" — active at the top of the home page (no section in view).
              active = isHome && activeSection === "";
            } else {
              active = pathname.startsWith(item.href);
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-body-sm font-semibold transition-colors",
                  active ? "text-brand" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-brand animate-m-fade" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-whatsapp hover:bg-success-50 sm:inline-flex"
            leftIcon={<MessageCircle className="h-[18px] w-[18px]" />}
            onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}`, "_blank")}
          >
            WhatsApp
          </Button>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserIcon className="h-[18px] w-[18px]" />}
              onClick={() => router.push(user.role === "admin" ? "/admin" : "/account")}
            >
              {user.name.split(" ")[0]}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
