import type { Metadata } from "next";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <div className="container-app max-w-3xl py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}
