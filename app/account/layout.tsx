import { AuthGate } from "@/components/shared/AuthGate";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="container-app mx-auto max-w-2xl pb-24 pt-2 md:pb-12">{children}</div>
    </AuthGate>
  );
}
