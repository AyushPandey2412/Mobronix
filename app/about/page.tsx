import type { Metadata } from "next";
import {
  BadgeIndianRupee, Recycle, ShieldCheck, Zap, Heart, CheckCircle2, Globe, Compass, Phone, Mail
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Mobronix, our mission, values, and how we recycle and buy back devices responsibly.",
};

export default function AboutPage() {
  return (
    <main className="py-12 md:py-24 bg-gradient-to-b from-background via-neutral-50/50 to-background">
      <div className="container-app">
        {/* Main Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[11px] sm:text-caption font-bold text-brand uppercase tracking-wider bg-primary-50 border border-primary-100 rounded-full px-3 py-1">
            About Us
          </span>
          <h1 className="mt-4 text-body-xl md:text-[36px] font-extrabold tracking-tight text-text-primary leading-tight">
            Your Trusted Partner for Selling Used Devices
          </h1>
          <p className="mt-4 text-body-md text-text-secondary leading-relaxed">
            Welcome to <strong>Mobronix</strong>! We make it easy to sell your old mobile phones quickly, safely, and at a fair price. Our goal is to give every device a second life while helping reduce electronic waste. Whether you want to sell your old phone, buy a quality pre-owned device, or recycle an unwanted gadget, Mobronix is here to help.
          </p>
        </div>

        {/* What We Do */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-center text-label sm:text-body-md font-extrabold uppercase tracking-wider text-text-tertiary">
            What We Do
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            <div className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-md transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-brand group-hover:scale-110 transition-transform duration-300">
                <BadgeIndianRupee className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-body-md font-bold text-text-primary">
                Sell Your Phone
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                Get the best value for your used smartphone. Our pricing is fair, the process is simple, and payments are made quickly.
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-body-md font-bold text-text-primary">
                Recycle Responsibly
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                Devices that cannot be reused are recycled safely to help protect the environment and reduce e-waste.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-center text-label sm:text-body-md font-extrabold uppercase tracking-wider text-text-tertiary">
            Our Values
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-brand/30 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-body-md font-bold text-text-primary">
                Trust
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                We believe in honest pricing, secure transactions, and protecting your personal information.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-amber-500/30 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-body-md font-bold text-text-primary">
                Simplicity
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                Our process is quick and easy, from getting a quote to receiving payment.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-body-md font-bold text-text-primary">
                Sustainability
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                We help give used devices a second life and recycle them responsibly for a greener future.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us & Mission/Vision Split layout */}
        <div className="mt-16 md:mt-24 grid gap-10 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Why Choose Mobronix? */}
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-xs">
            <h2 className="text-body-lg font-extrabold text-text-primary">
              Why Choose Mobronix?
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "Best prices for your used devices",
                "Instant payment after pickup and verification",
                "Free doorstep pickup",
                "Safe, secure, and transparent process",
                "Friendly customer support",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-body-sm text-text-secondary leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission & Vision */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary-100 hover:bg-neutral-50/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-brand">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-body-md font-bold text-text-primary">
                  Our Mission
                </h3>
              </div>
              <p className="mt-3 text-body-sm text-text-secondary leading-relaxed">
                To make buying and recycling mobile devices simple, affordable, and environmentally responsible.
              </p>
            </div>

            <div className="flex-1 rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary-100 hover:bg-neutral-50/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-brand">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="text-body-md font-bold text-text-primary">
                  Our Vision
                </h3>
              </div>
              <p className="mt-3 text-body-sm text-text-secondary leading-relaxed">
                To build a future where every electronic device is reused, refurbished, or recycled instead of being wasted.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Us Card */}
        <div className="mt-16 md:mt-24 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50/40 via-surface to-primary-50/20 p-6 md:p-10 max-w-4xl mx-auto shadow-xs text-center">
          <h2 className="text-body-lg font-extrabold text-text-primary">
            Contact Us
          </h2>
          <p className="mt-3 text-body-sm sm:text-body-md text-text-secondary leading-relaxed max-w-2xl mx-auto">
            At Mobronix, we&apos;re committed to making technology more affordable and sustainable. Thank you for choosing us and being part of a greener future.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:7700902077"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-xl bg-brand px-6 py-3 text-body-sm font-bold text-white hover:bg-brand-hover active:scale-[0.98] transition-all shadow-xs"
            >
              <Phone className="h-4 w-4" /> Call: +91 7700902077
            </a>
            <a
              href="mailto:support@mobronix.com"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-xl border border-border bg-surface px-6 py-3 text-body-sm font-bold text-text-primary hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-xs"
            >
              <Mail className="h-4 w-4" /> Email: support@mobronix.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
