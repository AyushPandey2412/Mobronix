"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { createBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export interface AuthFormProps {
  /** Called after a successful seller login/signup. Admins are handled via onAdmin. */
  onSuccess?: () => void;
  /** Called after a successful Supabase admin login (defaults to nothing). */
  onAdmin?: () => void;
  /** Start on the signup tab instead of login. */
  initialMode?: Mode;
}

/**
 * Shared login / signup form built on the local Zustand auth store.
 * Email logins are additionally checked against Supabase so real admin
 * accounts (profiles.role = 'admin') are recognised.
 * Used by the /login page and inline on the checkout step.
 */
export function AuthForm({ onSuccess, onAdmin, initialMode = "login" }: AuthFormProps) {
  const storeLogin  = useStore((s) => s.login);
  const storeSignup = useStore((s) => s.signup);
  const sb          = useMemo(() => createBrowserClient(), []);

  const [mode,     setMode]     = useState<Mode>(initialMode);
  const [identity, setIdentity] = useState("");
  const [name,     setName]     = useState("");
  const [mobile,   setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    const id  = identity.trim();
    const pwd = password.trim();

    // 1. Try Supabase email login first (for real admin accounts)
    if (id.includes("@")) {
      const { data, error: sbErr } = await sb.auth.signInWithPassword({ email: id, password: pwd });
      if (!sbErr && data.user) {
        const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).single();
        if (profile?.role === "admin") {
          setLoading(false);
          (onAdmin ?? onSuccess)?.();
          return;
        }
        storeLogin(id, pwd);
        setLoading(false);
        onSuccess?.();
        return;
      }
    }

    // 2. Local Zustand login (seller flow + demo admin)
    const res = storeLogin(id, pwd);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Invalid credentials."); return; }
    if (res.role === "admin") { (onAdmin ?? onSuccess)?.(); return; }
    onSuccess?.();
  }

  function handleSignup() {
    const res = storeSignup(name, mobile, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Could not create your account."); return; }
    onSuccess?.();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "login") await handleLogin();
    else handleSignup();
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-neutral-100 p-1">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={
              "flex-1 rounded-lg py-2 text-body-sm font-semibold transition-all " +
              (mode === m ? "bg-surface text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary")
            }
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form
        key={mode}
        onSubmit={submit}
        className="space-y-4 animate-m-fade-up"
      >
        {mode === "login" ? (
          <Input
            label="Name, phone or email"
            placeholder="Enter your name, number or email"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            autoComplete="username"
          />
        ) : (
          <>
            <Input
              label="Full name"
              placeholder="e.g. Aisha Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Mobile number"
              placeholder="10-digit mobile number"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              autoComplete="tel"
            />
          </>
        )}

        <Input
          label="Password"
          type="password"
          placeholder={mode === "login" ? "Enter your password" : "Create a password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <Button type="submit" size="lg" fullWidth isLoading={loading}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-caption text-text-tertiary">
        {mode === "login" ? (
          <>New here?{" "}
            <button type="button" onClick={() => { setMode("signup"); setError(null); }} className="font-semibold text-brand">
              Create an account
            </button>
          </>
        ) : (
          <>Already have an account?{" "}
            <button type="button" onClick={() => { setMode("login"); setError(null); }} className="font-semibold text-brand">
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
