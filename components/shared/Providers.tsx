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
import { AUTH_ACTIVITY_COOKIE, AUTH_SESSION_MAX_AGE_MS, AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/authSession";

const STORE_KEY = "sellmyiphone";

function readActivityAt() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${AUTH_ACTIVITY_COOKIE}=`));
  const value = cookie?.split("=")[1];
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function writeActivityAt(value = Date.now()) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_ACTIVITY_COOKIE}=${value}; Max-Age=${AUTH_SESSION_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  useStore.setState({ authSessionTouchedAt: value });
}

function clearActivityAt() {
  document.cookie = `${AUTH_ACTIVITY_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  useStore.setState({ authSessionTouchedAt: null });
}

function clearLegacyLocalStorage() {
  try {
    window.localStorage.removeItem(STORE_KEY);
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("sb-"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Browser storage may be unavailable in private modes.
  }
}

function AuthSync() {
  const setUser = useStore((s) => s.setContact);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    const supabase = createBrowserClient();

    clearLegacyLocalStorage();

    const syncUser = async (session: any, freshSignIn = false) => {
      if (!session?.user) {
        const currentUser = useStore.getState().user;
        if (currentUser) {
          logout();
        }
        clearActivityAt();
        return;
      }

      const now = Date.now();
      const lastActivityAt = readActivityAt();
      if (!freshSignIn && (!lastActivityAt || now - lastActivityAt > AUTH_SESSION_MAX_AGE_MS)) {
        await supabase.auth.signOut();
        clearActivityAt();
        logout();
        return;
      }

      writeActivityAt(now);

      const phone = session.user.phone || session.user.user_metadata?.phone || "";
      const name = session.user.user_metadata?.full_name || "Seller";
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = profile?.role === "admin" ? "admin" : "seller";
        setUser(name, phone, role);
      } catch (err) {
        setUser(name, phone, "seller");
      }
    };

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncUser(session, event === "SIGNED_IN");
    });

    let lastWrite = 0;
    const noteActivity = () => {
      if (!useStore.getState().user) return;
      const now = Date.now();
      if (now - lastWrite < 60 * 1000) return;
      lastWrite = now;
      writeActivityAt(now);
    };
    const activityEvents = ["pointerdown", "keydown", "touchstart", "focus"];
    activityEvents.forEach((event) => window.addEventListener(event, noteActivity, { passive: true }));

    return () => {
      subscription.unsubscribe();
      activityEvents.forEach((event) => window.removeEventListener(event, noteActivity));
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
