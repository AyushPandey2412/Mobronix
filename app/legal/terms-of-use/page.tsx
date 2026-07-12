import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for SellMyiPhone — please read carefully before using our services.",
};

const SECTIONS = [
  {
    heading: "1. Our Role",
    body: `SellMyiPhone acts as a platform that connects sellers with authorised third-party buyers. In some cases, SellMyiPhone or its partners may directly purchase your device. In other cases, your transaction may be with a third-party buyer. Third-party buyers are responsible for their own transactions with you. SellMyiPhone is not responsible for problems caused by a third-party buyer unless required by law.`,
  },
  {
    heading: "2. Legal Ownership of Your Device",
    body: null,
    bullets: [
      "You are the legal owner of the device.",
      "You have the full right to sell the device.",
      "The device is not stolen.",
      "The device is not involved in any legal dispute.",
      "The device does not have any unpaid loan, EMI, lien, or claim.",
    ],
    intro: "By selling a device through SellMyiPhone, you confirm that:",
  },
  {
    heading: "3. Estimated Price and Device Inspection",
    body: `The price shown on our website, app, or through our partners is an estimated price only. The final price will be decided after checking the device physically. We may refuse to buy any device if it does not meet our requirements. If the device matches the details you provided, we will offer the quoted price.`,
  },
  {
    heading: "4. Changes in the Offer Price",
    body: null,
    intro: "We may change the offered price if, during inspection, we find that:",
    bullets: [
      "The device model is different from what you selected.",
      "The device has damage that was not mentioned.",
      "The device is not working properly.",
      "Parts, accessories, or original components are missing.",
      "The display, battery, camera, speaker, microphone, Face ID, fingerprint sensor, or other features are not working.",
      "The device has been repaired, modified, or has duplicate parts.",
    ],
    outro: "If we offer a revised price, you can accept or reject it. If you reject the revised offer, the device will be returned to you without any extra charge.",
  },
  {
    heading: "5. Required Documents",
    body: null,
    intro: "To sell your device, you may need to provide:",
    bullets: [
      "A self-attested copy of a valid government ID, such as Aadhaar Card, Driving Licence, or Passport.",
    ],
  },
  {
    heading: "6. Payment Terms",
    body: null,
    intro: "Payment will be made only after:",
    bullets: [
      "Physical inspection of the device.",
      "Verification of your documents.",
      "Your acceptance of the final price.",
    ],
    outro: "Payment may be made through cash, bank transfer, UPI, or any other method agreed during the transaction.",
  },
  {
    heading: "7. Devices We Do Not Accept",
    body: null,
    intro: "You must not sell any device that is:",
    bullets: [
      "Stolen",
      "Used for illegal activities",
      "Blacklisted",
      "IMEI-blocked or locked",
      "Locked with an unknown iCloud account, Google account, password, or activation lock",
      "Under an unpaid loan, EMI, or financial claim",
    ],
    outro: "If we find a prohibited device, we may cancel the transaction and report the matter to the police or other authorities.",
  },
  {
    heading: "8. Your Device Data",
    body: null,
    intro: "Before giving your device to us, you must:",
    bullets: [
      "Back up your important photos, contacts, files, and data.",
      "Remove your SIM card and memory card.",
      "Sign out of iCloud, Google, Find My Device, and all other accounts.",
      "Factory reset the device.",
    ],
    outro: "SellMyiPhone may help you reset your device if requested. However, SellMyiPhone is not responsible for any loss of your personal data.",
  },
  {
    heading: "9. Liability",
    body: null,
    intro: "SellMyiPhone is not responsible for:",
    bullets: [
      "Loss of personal data if you do not back up or erase your device.",
      "Problems caused by third-party buyers.",
      "Damage or loss caused by events outside our control.",
    ],
    outro: "SellMyiPhone will be responsible for loss or damage to your device only if it happens because of our negligence.",
  },
  {
    heading: "10. Your Agreement to Sell",
    body: "If we confirm the final price after inspection and you accept it, you agree to sell the device at that price. After payment is completed and the device is handed over, the sale is final and cannot be cancelled.",
  },
  {
    heading: "11. Governing Law",
    body: "These Terms of Use are governed by the laws of India. Any legal dispute will be handled by the courts in Mumbai, India.",
  },
  {
    heading: "12. Changes to These Terms",
    body: "SellMyiPhone may update these Terms of Use at any time. If you continue to use our website, app, or services after changes are posted, it means you accept the updated Terms.",
  },
  {
    heading: "13. Communication",
    body: null,
    intro: "We may send you service updates, transaction details, offers, and promotional messages through:",
    bullets: ["SMS", "Email", "WhatsApp", "Phone calls", "Other communication channels"],
    outro: "You can stop promotional messages at any time by contacting us.",
  },
  {
    heading: "14. Contact Us",
    body: "For any questions or concerns, contact us at support@sellmyiphone.in or call +91 00000 00000.",
  },
];

export default function TermsOfUsePage() {
  return (
    <article>
      <div className="mb-10 border-b border-border pb-8">
        <p className="text-overline uppercase text-brand">Legal</p>
        <h1 className="mt-2 text-h1 font-extrabold tracking-tight text-text-primary">Terms of Use</h1>
        <p className="mt-3 text-body-md text-text-secondary">
          Please read these Terms of Use carefully before using our services.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-caption text-text-tertiary">
          <span>Last Updated: 1 July 2026</span>
          <span>·</span>
          <span>Governing Law: India · Mumbai Courts</span>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-primary-100 bg-primary-50 px-5 py-4 text-body-sm text-text-secondary leading-relaxed">
        These Terms of Use are a legal agreement between <strong className="text-text-primary">you</strong> (the person selling a device), <strong className="text-text-primary">SellMyiPhone</strong> (our platform), and <strong className="text-text-primary">third-party buyers</strong> who may purchase your device through us. SellMyiPhone helps customers sell, recycle, or resell used electronic devices. By using our website, app, or services, you agree to these Terms.
      </div>

      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-h4 font-bold text-text-primary">{s.heading}</h2>
            {s.intro && <p className="mt-3 text-body-sm text-text-secondary">{s.intro}</p>}
            {s.bullets && (
              <ul className="mt-3 space-y-2 pl-1">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-body-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {s.body && <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">{s.body}</p>}
            {s.outro && <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">{s.outro}</p>}
          </section>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8 text-body-sm text-text-tertiary">
        By using SellMyiPhone&apos;s services, you confirm that you have read, understood, and agreed to these Terms of Use.{" "}
        <Link href="/legal/privacy-policy" className="text-brand hover:underline">Privacy Policy</Link>
        {" · "}
        <Link href="/legal/terms-and-conditions" className="text-brand hover:underline">Terms and Conditions</Link>
      </div>
    </article>
  );
}
