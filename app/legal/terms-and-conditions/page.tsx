import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for using SellMyiPhone's website, app, and services.",
};

const SECTIONS = [
  {
    heading: "1. Our Services",
    body: "SellMyiPhone helps people sell their used mobile phones. You can use our website or app to get an estimated price for your phone through our AI-based valuation system. If you accept the estimated price, you can book a pickup and share details such as your address, contact number, and government ID proof. Our representative will inspect the phone physically and give you the final price.",
  },
  {
    heading: "2. Your Responsibilities",
    intro: "When you sell a phone through SellMyiPhone, you agree to:",
    bullets: [
      "Give correct and complete information about your phone, including model, condition, damage, and working status.",
      "Confirm that you are the legal owner of the phone and have the right to sell it.",
      "Remove all personal data, accounts, passwords, photos, files and factory reset the phone before handing it over.",
      "Show a valid government-issued ID during the transaction.",
    ],
  },
  {
    heading: "3. Price and Valuation",
    body: null,
    intro: "The price shown on our website or app is only an estimated price. The final price may change after our representative checks the phone physically. We may reduce or cancel the offer if we find:",
    bullets: [
      "Damage not mentioned earlier",
      "Missing parts or accessories",
      "Incorrect phone details",
      "Problems with the phone's display, battery, camera, Face ID, fingerprint sensor, or other functions",
    ],
  },
  {
    heading: "4. Final Offer and Payment",
    body: "Payment will be made only after you accept the final price offered after inspection. Payment may be made through bank transfer or UPI. Once payment is completed and the phone is handed over, the transaction cannot be reversed.",
  },
  {
    heading: "5. Cancellation Policy",
    subsections: [
      {
        sub: "Customer Cancellation",
        body: "You can cancel the sale any time before the final inspection is completed.",
      },
      {
        sub: "SellMyiPhone Cancellation",
        body: "SellMyiPhone can cancel a transaction if we find suspicious, fraudulent, illegal, or incorrect information.",
      },
    ],
  },
  {
    heading: "6. Privacy and Data Security",
    body: "We take your privacy seriously. For details about how we collect, use, and protect your information, please read our Privacy Policy.",
  },
  {
    heading: "7. Transfer of Device Ownership",
    body: "Once you accept the final offer, receive payment, and hand over the phone, ownership of the phone transfers to SellMyiPhone or its authorised partner. You cannot ask for the phone back after the transaction is completed.",
  },
  {
    heading: "8. Devices We Do Not Accept",
    intro: "We do not accept phones that are:",
    bullets: [
      "Reported stolen",
      "Counterfeit or duplicate",
      "Locked with an unknown password, iCloud account, Google account, or activation lock",
      "Not legally owned by the seller",
    ],
  },
  {
    heading: "9. Legal Compliance",
    body: "You are responsible for making sure that selling your phone is legal. SellMyiPhone may report suspicious, stolen, fraudulent, or illegal devices to the police or other authorities.",
  },
  {
    heading: "10. Changes to These Terms",
    body: "SellMyiPhone may update these Terms and Conditions at any time. By continuing to use our website, app, or services after changes are made, you agree to the updated Terms and Conditions.",
  },
];

function Section({ s }: { s: any }) {
  return (
    <section>
      <h2 className="text-h4 font-bold text-text-primary">{s.heading}</h2>
      {s.intro && <p className="mt-3 text-body-sm text-text-secondary">{s.intro}</p>}
      {s.bullets && (
        <ul className="mt-3 space-y-2 pl-1">
          {s.bullets.map((b: string) => (
            <li key={b} className="flex items-start gap-3 text-body-sm text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {s.body && <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">{s.body}</p>}
      {s.outro && <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">{s.outro}</p>}
      {s.subsections && (
        <div className="mt-4 space-y-4 pl-4 border-l border-border">
          {s.subsections.map((sub: any) => (
            <div key={sub.sub}>
              <h3 className="text-body-md font-semibold text-text-primary">{sub.sub}</h3>
              {sub.body && <p className="mt-1.5 text-body-sm leading-relaxed text-text-secondary">{sub.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <article>
      <div className="mb-10 border-b border-border pb-8">
        <p className="text-overline uppercase text-brand">Legal</p>
        <h1 className="mt-2 text-h1 font-extrabold tracking-tight text-text-primary">Terms and Conditions</h1>
        <p className="mt-3 text-body-md text-text-secondary">
          Please read these Terms and Conditions carefully before using our services.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-caption text-text-tertiary">
          <span>Effective Date: 1 July 2026</span>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-primary-100 bg-primary-50 px-5 py-4 text-body-sm text-text-secondary leading-relaxed">
        Welcome to SellMyiPhone. These Terms and Conditions apply when you use our website, mobile app, or services. By using our services, you agree to these terms. If you do not agree, please do not use our services.
      </div>

      <div className="space-y-10">
        {SECTIONS.map((s) => <Section key={s.heading} s={s} />)}
      </div>

      <div className="mt-12 border-t border-border pt-8 text-body-sm text-text-tertiary">
        <Link href="/legal/terms-of-use" className="text-brand hover:underline">Terms of Use</Link>
        {" · "}
        <Link href="/legal/privacy-policy" className="text-brand hover:underline">Privacy Policy</Link>
      </div>
    </article>
  );
}
