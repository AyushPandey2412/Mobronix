"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

/** Client-side route guard. Redirects to /login when there is no session. */
export function AuthGate({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const router = useRouter();
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (admin && user.role !== "admin") {
      router.replace("/");
    } else if (!admin && user.role === "admin") {
      router.replace("/admin");
    }
  }, [user, admin, router]);

  if (!user || (admin && user.role !== "admin") || (!admin && user.role === "admin")) {
    return null;
  }
  return <>{children}</>;
}
