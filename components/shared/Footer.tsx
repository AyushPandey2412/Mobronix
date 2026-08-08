"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { toast } from "@/lib/toast";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-neutral-900 text-neutral-300">
      <div className="container-app grid gap-10 pt-12 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-neutral-400">
            Honest Deals. Trusted Buyback. Free doorstep pickup, instant price estimate, same-day
            UPI payment across Mumbai, Navi Mumbai, Thane &amp; Sangli.
          </p>
          <ul className="mt-4 space-y-2 text-body-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-brand" /> +91 7700902077
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-brand" /> officialmobronix@gmail.com
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="text-label font-semibold text-white">About</h4>
          <ul className="mt-4 space-y-3 text-body-sm text-neutral-400">
            <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/#about" className="hover:text-white transition-colors">Contact</Link></li>
            <li><button onClick={() => toast("Contact officialmobronix@gmail.com to partner with us.")} className="hover:text-white transition-colors text-left">Partner With Us</button></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-label font-semibold text-white">Services</h4>
          <ul className="mt-4 space-y-2.5 text-body-sm text-neutral-400">
            <li><Link href="/sell/iphone" className="hover:text-white transition-colors">Sell Phone</Link></li>
            <li><button onClick={() => toast("Tablet valuation is coming soon.")} className="hover:text-white transition-colors text-left">Sell Tablet</button></li>
            <li><Link href="/sell/macbook" className="hover:text-white transition-colors">Sell Laptop</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-label font-semibold text-white">Support</h4>
          <ul className="mt-4 space-y-3 text-body-sm text-neutral-400">
            <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link href="/legal/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-6">
        <p className="text-center text-[11px] leading-relaxed text-neutral-600 max-w-3xl mx-auto">
          All trademarks, logos, and brand names belong to their respective owners. They are used only for identification purposes and do not imply any endorsement or affiliation with Mobronix.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-caption text-neutral-600">
          <span>© 2026 Mobronix. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <Link href="/legal/privacy-policy" className="hover:text-neutral-400 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/legal/terms-of-use" className="hover:text-neutral-400 transition-colors">Terms of Use</Link>
          <span>·</span>
          <Link href="/legal/terms-and-conditions" className="hover:text-neutral-400 transition-colors">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
