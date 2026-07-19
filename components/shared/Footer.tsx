"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { toast } from "@/lib/toast";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-neutral-900 text-neutral-300">
      <div className="container-app grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Logo className="text-white [&_span]:text-white" />
          <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-neutral-400">
            Honest Deals. Trusted Buyback. Free doorstep pickup, instant price estimate, same-day
            UPI payment across Mumbai, Navi Mumbai &amp; Thane.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-caption font-semibold text-neutral-200">
            <ShieldCheck className="h-4 w-4 text-success-400" /> IMEI-verified &amp; insured pickups
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-label font-semibold text-white">Company</h4>
          <ul className="mt-4 space-y-3 text-body-sm text-neutral-400">
            <li><Link href="/" className="hover:text-white transition-colors">Sell your phone</Link></li>
            <li><Link href="/#how" className="hover:text-white transition-colors">How it works</Link></li>
            <li><Link href="/track" className="hover:text-white transition-colors">Track an order</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-label font-semibold text-white">Legal</h4>
          <ul className="mt-4 space-y-3 text-body-sm text-neutral-400">
            <li><Link href="/legal/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
            <li><Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-label font-semibold text-white">Reach us</h4>
          <ul className="mt-4 space-y-3 text-body-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> Mumbai · Navi Mumbai · Thane
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> +91 00000 00000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> support@mobronix.in
            </li>
          </ul>
          <div className="mt-5 flex gap-2">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white/5 px-3 py-2.5 text-caption font-bold text-white hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <button
              onClick={() => toast("This dials support on the live site.")}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white/5 px-3 py-2.5 text-caption font-bold text-white hover:bg-white/10 transition-colors"
            >
              <Phone className="h-4 w-4" /> Call us
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-6">
        <p className="text-center text-[11px] leading-relaxed text-neutral-600 max-w-3xl mx-auto">
          All product names, trademarks, logos, and brand names displayed on this website are the
          property of their respective owners. They are used solely for identification and
          informational purposes. Their use does not imply any affiliation with, endorsement by, or
          sponsorship of this website or its services.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-caption text-neutral-600">
          <span>© {new Date().getFullYear()} Mobronix. All rights reserved.</span>
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
