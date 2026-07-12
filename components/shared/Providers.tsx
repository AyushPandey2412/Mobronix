"use client";

import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/Toaster";

/**
 * Client providers:
 *  1. QueryClientProvider — TanStack Query (caches Supabase reads)
 *  2. Toaster             — toast notification host
 *
 * The old full-page visibility:hidden hydration guard is removed.
 * Zustand's persisted state is now read only in the specific components
 * that need it (header user name, cart count in nav), so there is no
 * whole-page flash to prevent. Individual components handle their own
 * hydration if needed.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<QueryClient | null>(null);
  if (!clientRef.current) clientRef.current = makeQueryClient();

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
