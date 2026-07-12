"use client";

import { create } from "zustand";

export interface ToastItem {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
  /** True while the toast is animating out (just before it's removed). */
  leaving?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, tone?: ToastItem["tone"]) => void;
  dismiss: (id: number) => void;
}

let seq = 0;
const EXIT_MS = 280; // keep in sync with the m-toast-out animation duration

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message, tone = "default") => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => {
      // Start the exit animation, then remove after it finishes.
      set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), EXIT_MS);
    }, 2600);
  },
  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), EXIT_MS);
  },
}));

/** Imperative helper usable outside React. */
export const toast = (message: string, tone?: ToastItem["tone"]) =>
  useToast.getState().show(message, tone);
