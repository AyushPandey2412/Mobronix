// The sell flow is intentionally NOT auth-gated. Guests can browse models,
// answer the condition questions and see their quote without an account —
// login/signup is requested inline on the checkout step, right before the
// enquiry is submitted (Cashify-style).
export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <div className="container-app pb-40 pt-2 md:pb-16">{children}</div>;
}
