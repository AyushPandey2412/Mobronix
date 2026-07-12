import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SellMyiPhone collects, uses, and protects your information.",
};

const SECTIONS = [
  {
    heading: "Who We Are",
    body: "SellMyiPhone is a mobile retail and service business based in Thane, India. For privacy-related questions, contact us at support@sellmyiphone.in or call +91 00000 00000.",
  },
  {
    heading: "Information We Collect",
    subsections: [
      {
        sub: "1. Information You Give Us",
        bullets: [
          "Your name, phone number, email address",
          "Address for pickup, billing, or delivery",
          "Device details such as model, condition, and IMEI number",
          "Government ID details, when needed for device selling transactions",
          "Messages, feedback, complaints, or enquiries you send us",
        ],
      },
      {
        sub: "2. Information Collected Automatically",
        body: "When you visit our website, we may collect device type, pages you visit, date and time of your visit, and website usage information. We may also use cookies and similar technologies to improve website performance and user experience.",
      },
      {
        sub: "3. Information From Other Sources",
        body: "We may collect limited information from publicly available sources or social media platforms if you interact with our social media accounts.",
      },
    ],
  },
  {
    heading: "How We Use Your Information",
    subsections: [
      {
        sub: "1. To Provide Our Services",
        bullets: [
          "Help you sell your used mobile phone",
          "Schedule device pickup",
          "Process payments and transactions",
          "Deliver products or services",
          "Verify your identity when required",
        ],
      },
      {
        sub: "2. Customer Support",
        bullets: [
          "Answer your questions",
          "Handle complaints and feedback",
          "Give updates about your pickup, order, payment, or service request",
        ],
      },
      {
        sub: "3. Marketing and Updates",
        body: "We may send you offers, promotions, updates, and newsletters through SMS, Email, WhatsApp, phone calls, and other communication channels. You can stop promotional messages at any time by contacting us at support@sellmyiphone.in.",
      },
      {
        sub: "4. Improve Our Services",
        body: "We may study how customers use our website and services to improve website performance, improve customer experience, and create new products, features, and services.",
      },
      {
        sub: "5. Security and Legal Requirements",
        bullets: [
          "Prevent fraud and suspicious activity",
          "Protect our website and customers",
          "Follow legal requirements",
          "Cooperate with government authorities when required by law",
        ],
      },
    ],
  },
  {
    heading: "Sharing Your Information",
    body: "We may share your information only when needed for business, legal, or service-related purposes. We may share information with payment service providers, pickup and delivery partners, technology and customer support providers, government authorities or law enforcement if required by law, and business partners during a merger, acquisition, or sale of business assets.",
    outro: "We do not sell or rent your personal information to other companies.",
  },
  {
    heading: "Data Security",
    body: "We use security measures such as secure servers, restricted access, and encryption to protect your information. However, no website, app, or online system can be completely secure. While we work to protect your data, we cannot guarantee complete security.",
  },
  {
    heading: "Your Responsibilities",
    bullets: [
      "Please keep your OTPs, passwords, and login details private.",
      "Do not share OTPs or account details with anyone.",
      "Contact us immediately if you believe someone has accessed your account without permission.",
    ],
  },
  {
    heading: "Your Rights",
    intro: "You may have the right to:",
    bullets: [
      "Ask for a copy of your personal information",
      "Correct incorrect or incomplete information",
      "Request deletion of your information in certain cases",
      "Limit how we use your information",
      "Object to marketing messages",
      "Withdraw your consent where applicable",
    ],
    outro: "To request any of these, email us at support@sellmyiphone.in. We will try to respond within 30 days.",
  },
  {
    heading: "How Long We Keep Your Information",
    body: "We keep your information only for as long as needed to provide our services, complete transactions, follow legal requirements, resolve disputes, and prevent fraud. When your information is no longer needed, we will securely delete it or make it anonymous.",
  },
  {
    heading: "Children's Privacy",
    body: "Our services are not for people under 18 years of age. If we find that we have collected personal information from a person under 18 without proper consent, we will delete it as soon as possible.",
  },
  {
    heading: "Changes to This Privacy Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on our website. Please check this page regularly to stay updated.",
  },
  {
    heading: "Contact Us",
    body: "If you have questions, concerns, or complaints about this Privacy Policy or your personal information, contact us at support@sellmyiphone.in or call +91 00000 00000.",
  },
];

function Section({ s }: { s: typeof SECTIONS[number] }) {
  return (
    <section>
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
      {s.subsections && (
        <div className="mt-4 space-y-6 pl-4 border-l border-border">
          {s.subsections.map((sub) => (
            <div key={sub.sub}>
              <h3 className="text-body-md font-semibold text-text-primary">{sub.sub}</h3>
              {sub.bullets && (
                <ul className="mt-2 space-y-1.5 pl-1">
                  {sub.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-body-sm text-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {sub.body && <p className="mt-2 text-body-sm leading-relaxed text-text-secondary">{sub.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <article>
      <div className="mb-10 border-b border-border pb-8">
        <p className="text-overline uppercase text-brand">Legal</p>
        <h1 className="mt-2 text-h1 font-extrabold tracking-tight text-text-primary">Privacy Policy</h1>
        <p className="mt-3 text-body-md text-text-secondary">
          How we collect, use, and protect your information.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-caption text-text-tertiary">
          <span>Effective Date: 1 July 2026</span>
          <span>·</span>
          <span>Last Updated: 1 July 2026</span>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-primary-100 bg-primary-50 px-5 py-4 text-body-sm text-text-secondary leading-relaxed">
        At SellMyiPhone, we respect your privacy and work to keep your personal information safe. This Privacy Policy explains what information we collect, why we collect it, how we use it, and how we protect it. By using our website or services, you agree to this Privacy Policy.
      </div>

      <div className="space-y-10">
        {SECTIONS.map((s) => <Section key={s.heading} s={s as any} />)}
      </div>

      <div className="mt-12 border-t border-border pt-8 text-body-sm text-text-tertiary">
        By using SellMyiPhone&apos;s website and services, you confirm that you have read and understood this Privacy Policy.{" "}
        <Link href="/legal/terms-of-use" className="text-brand hover:underline">Terms of Use</Link>
        {" · "}
        <Link href="/legal/terms-and-conditions" className="text-brand hover:underline">Terms and Conditions</Link>
      </div>
    </article>
  );
}
