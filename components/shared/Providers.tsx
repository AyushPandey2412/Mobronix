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
import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

function AuthSync() {
  const setUser = useStore((s) => s.setContact);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    const supabase = createBrowserClient();

    const syncUser = async (session: any) => {
      if (!session?.user) {
        const currentUser = useStore.getState().user;
        if (currentUser) {
          logout();
        }
        return;
      }
      const phone = session.user.phone || session.user.user_metadata?.phone || "";
      const name = session.user.user_metadata?.full_name || "Seller";
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = profile?.role || "seller";
        setUser(name, phone, role);
      } catch (err) {
        console.error("AuthSync error fetching profile role", err);
        setUser(name, phone, "seller");
      }
    };

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncUser(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, logout]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<QueryClient | null>(null);
  if (!clientRef.current) clientRef.current = makeQueryClient();

  return (
    <QueryClientProvider client={clientRef.current}>
      <AuthSync />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
