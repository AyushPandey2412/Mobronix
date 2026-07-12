"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MODELS,
  MACBOOK_MODELS,
  QUESTIONS,
  MAC_QUESTIONS,
  SEED_ENQUIRIES,
  EXECUTIVES,
  TRACK_STEPS,
  getModel,
} from "./data";
import { calcQuote } from "./quote";
import { makeEnquiryId } from "./utils";
import type {
  AnswerMap,
  CartDevice,
  Enquiry,
  EnquiryStatus,
  Model,
  PhotoState,
  Question,
  Quote,
  User,
} from "./types";

interface CheckoutForm {
  address: string;
  pincode: string;
  slot: string | null;
  pay: string | null;
}

interface Settings {
  pushNotif: boolean;
  smsUpdates: boolean;
  language: "EN" | "HI";
}

interface AppState {
  // catalog (admin-editable)
  models: Model[];
  questions: Question[];
  // The exact question set currently shown in the sell flow (from Supabase or
  // local fallback). The quote is computed against THIS so answer indices line up.
  activeQuestions: Question[];
  enquiries: Enquiry[];

  // auth
  user: User | null;

  // active sell flow
  selectedModelId: string | null;
  selectedStorage: string | null;
  answers: AnswerMap;
  quote: Quote | null;
  photos: Record<string, PhotoState>;
  cart: CartDevice[];
  checkout: CheckoutForm;

  // seller's most recent enquiry + tracking
  enquiry: Enquiry | null;
  lastSeenStep: number;
  editingEnquiry: boolean;

  settings: Settings;

  // ---- auth actions ----
  login: (identity: string, password: string) => { ok: boolean; role?: "seller" | "admin"; error?: string };
  signup: (name: string, mobile: string, password: string) => { ok: boolean; role?: "seller"; error?: string };
  phoneLogin: (mobile: string) => { ok: boolean; role?: "seller"; error?: string };
  /** Set the seller's contact name + phone (used by the checkout contact form). */
  setContact: (name: string, mobile: string) => void;
  logout: () => void;

  // ---- catalog ----
  selectModel: (id: string) => void;
  setStorage: (s: string) => void;

  // ---- condition / quote ----
  setAnswer: (qIndex: number, answer: AnswerMap[number]) => void;
  resetSellFlow: () => void;
  computeQuote: () => Quote;

  // ---- cart ----
  addCurrentToCart: () => void;
  removeFromCart: (index: number) => void;
  promoteCartToActive: () => void;

  // ---- photos ----
  setPhoto: (slotId: string, state: Partial<PhotoState>) => void;

  // ---- checkout ----
  setCheckout: (patch: Partial<CheckoutForm>) => void;
  submitEnquiry: () => Enquiry;
  patchCurrentEnquiry: (patch: Partial<Enquiry>) => void;
  startEditPickup: () => void;
  updateEnquiryPickup: () => void;
  cancelEnquiry: () => void;
  rateEnquiry: (rating: number) => void;
  advanceTracking: () => boolean;
  markStepSeen: () => void;

  // ---- settings ----
  toggleSetting: (key: "pushNotif" | "smsUpdates") => void;
  setLanguage: (lang: "EN" | "HI") => void;

  // ---- admin ----
  updateEnquiry: (id: string, patch: Partial<Enquiry>, action?: string) => void;
  deleteEnquiry: (id: string) => void;
  bulkUpdateStatus: (ids: string[], status: EnquiryStatus) => void;
  bulkDelete: (ids: string[]) => void;
  saveModel: (model: Model, existingId?: string) => void;
  deleteModel: (id: string) => void;
  saveQuestion: (q: Question, index: number | null) => void;
  deleteQuestion: (index: number) => void;
}

const emptyCheckout: CheckoutForm = { address: "", pincode: "", slot: null, pay: null };

/** Resolve the active model from the live store list (which includes
 *  Supabase-synced models, keyed by UUID) first, then fall back to the local
 *  seed data. Using getModel() alone returns undefined for Supabase models
 *  (their id is a UUID, not a local short id) → base price of 0. */
function resolveActiveModel(models: Model[], id: string | null): Model | undefined {
  if (!id) return undefined;
  return models.find((m) => m.id === id) ?? getModel(id);
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      models: [...MODELS, ...MACBOOK_MODELS],
      questions: QUESTIONS,
      activeQuestions: [],
      enquiries: SEED_ENQUIRIES,

      user: null,

      selectedModelId: null,
      selectedStorage: null,
      answers: {},
      quote: null,
      photos: {},
      cart: [],
      checkout: { ...emptyCheckout },

      enquiry: null,
      lastSeenStep: 0,
      editingEnquiry: false,

      settings: { pushNotif: true, smsUpdates: true, language: "EN" },

      login: (identity, password) => {
        const id = identity.trim();
        const pwd = password.trim();
        // NOTE: the hardcoded `admin`/`admin123` backdoor was removed. Admin access
        // is granted ONLY to a real Supabase user whose profiles.role = 'admin'
        // (handled in AuthForm via signInWithPassword) and enforced in middleware.ts.
        if (!id || !pwd) {
          return { ok: false, error: "Please enter your name or phone number, and a password, to continue." };
        }
        const isPhone = /^\d{6,}$/.test(id);
        const user: User = isPhone
          ? { name: "Seller", mobile: id, role: "seller" }
          : { name: id, mobile: id, role: "seller" };
        set({ user });
        return { ok: true, role: "seller" };
      },

      signup: (name, mobile, password) => {
        const n = name.trim();
        const m = mobile.trim();
        const pwd = password.trim();
        if (!n) return { ok: false, error: "Please enter your name to create an account." };
        if (!/^\d{10}$/.test(m)) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
        if (pwd.length < 4) return { ok: false, error: "Please choose a password of at least 4 characters." };
        set({ user: { name: n, mobile: m, role: "seller" } });
        return { ok: true, role: "seller" };
      },

      phoneLogin: (mobile) => {
        const m = mobile.trim();
        if (!/^\d{10}$/.test(m)) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
        set((st) => ({ user: { name: st.user?.name ?? "Seller", mobile: m, role: "seller" } }));
        return { ok: true, role: "seller" };
      },

      setContact: (name, mobile) =>
        set((st) => ({
          user: {
            name: name.trim() || st.user?.name || "Seller",
            mobile: mobile.trim() || st.user?.mobile || "",
            role: st.user?.role === "admin" ? "admin" : "seller",
          },
        })),

      logout: () =>
        set({
          user: null,
          selectedModelId: null,
          selectedStorage: null,
          answers: {},
          quote: null,
          photos: {},
          cart: [],
          checkout: { ...emptyCheckout },
        }),

      selectModel: (id) => set({ selectedModelId: id, selectedStorage: null }),
      setStorage: (s) => set({ selectedStorage: s }),

      setAnswer: (qIndex, answer) =>
        set((st) => ({ answers: { ...st.answers, [qIndex]: answer }, quote: null })),

      resetSellFlow: () =>
        set({
          selectedModelId: null,
          selectedStorage: null,
          answers: {},
          quote: null,
          photos: {},
        }),

      computeQuote: () => {
        const st = get();
        const model = resolveActiveModel(st.models, st.selectedModelId);
        // Handle both flat (iPhone) and nested (MacBook) storage pricing.
        // iPhone:  storages = { "128GB": 40000 }                 (flat)
        // MacBook: storages = { "M1": { "256GB": 62000, ... } }  (nested by chip)
        // `selectedStorage` is always a STORAGE size (e.g. "512GB"), so for the
        // nested shape we must find the chip tier that contains it — not just take
        // the first price (the old code did Object.values(undefined) → crash).
        let base = 0;
        if (model && st.selectedStorage) {
          const storageVal = (model.storages as Record<string, unknown>)[st.selectedStorage];
          if (typeof storageVal === "number") {
            base = storageVal;
          } else {
            for (const tier of Object.values(model.storages as Record<string, unknown>)) {
              if (tier && typeof tier === "object" && st.selectedStorage in (tier as object)) {
                base = (tier as Record<string, number>)[st.selectedStorage] ?? 0;
                break;
              }
            }
          }
        }
        // Use the exact questions the seller answered (set by the condition page).
        // Fall back to local data only if the flow somehow ran without them.
        const isMac = model?.category === "macbook";
        const questions = st.activeQuestions.length
          ? st.activeQuestions
          : isMac ? MAC_QUESTIONS : st.questions;
        const quote = calcQuote(base, st.answers, questions);
        set({ quote });
        return quote;
      },

      addCurrentToCart: () => {
        const st = get();
        const model = resolveActiveModel(st.models, st.selectedModelId);
        if (!model || !st.selectedStorage || !st.quote) return;
        const device: CartDevice = {
          modelId: model.id,
          model: model.name,
          storage: st.selectedStorage,
          base: st.quote.base,
          final: st.quote.final,
          breakdown: st.quote.breakdown,
          answers: { ...st.answers },
        };
        set({
          cart: [...st.cart, device],
          selectedModelId: null,
          selectedStorage: null,
          answers: {},
          quote: null,
          photos: {},
        });
      },

      removeFromCart: (index) =>
        set((st) => ({ cart: st.cart.filter((_, i) => i !== index) })),

      promoteCartToActive: () => {
        const st = get();
        if (st.selectedModelId || !st.cart.length) return;
        const last = st.cart[st.cart.length - 1];
        set({
          cart: st.cart.slice(0, -1),
          selectedModelId: last.modelId,
          selectedStorage: last.storage,
          answers: last.answers,
          quote: { base: last.base, final: last.final, breakdown: last.breakdown },
        });
      },

      setPhoto: (slotId, state) =>
        set((st) => {
          const prev: PhotoState = st.photos[slotId] ?? { done: false, path: null };
          return { photos: { ...st.photos, [slotId]: { ...prev, ...state } } };
        }),

      setCheckout: (patch) => set((st) => ({ checkout: { ...st.checkout, ...patch } })),

      submitEnquiry: () => {
        const st = get();
        const model = resolveActiveModel(st.models, st.selectedModelId);
        const cartDevices = st.cart.map((c) => ({ model: c.model, storage: c.storage, final: c.final }));
        const current = model && st.selectedStorage && st.quote
          ? [{ model: model.name, storage: st.selectedStorage, final: st.quote.final }]
          : [];
        const devices = [...cartDevices, ...current];
        const totalAmount = devices.reduce((s, d) => s + d.final, 0);
        const modelLabel =
          devices.length > 1 ? `${devices[0].model} +${devices.length - 1} more` : devices[0]?.model ?? "iPhone";
        const exec = EXECUTIVES[Math.floor(Math.random() * EXECUTIVES.length)];
        const now = new Date().toISOString();
        const enq: Enquiry = {
          id: makeEnquiryId(),
          name: st.user?.name ?? "Seller",
          mobile: st.user?.mobile ?? "",
          model: modelLabel,
          storage: st.selectedStorage ?? devices[0]?.storage ?? "",
          devices,
          amount: totalAmount,
          address: st.checkout.address,
          pincode: st.checkout.pincode,
          slot: st.checkout.slot ?? "",
          pay: st.checkout.pay ?? "UPI",
          step: 0,
          status: "new",
          note: "",
          createdAt: now,
          answers: { ...st.answers },
          exec,
          history: [{ ts: now, action: "Enquiry submitted" }],
        };
        set({
          enquiry: enq,
          enquiries: [enq, ...st.enquiries],
          cart: [],
          lastSeenStep: 1,
          selectedModelId: null,
          selectedStorage: null,
          answers: {},
          quote: null,
          photos: {},
          checkout: { ...emptyCheckout },
        });
        return enq;
      },

      patchCurrentEnquiry: (patch) =>
        set((st) => ({
          enquiry: st.enquiry ? { ...st.enquiry, ...patch } : st.enquiry,
          // also update the matching entry in the enquiries list
          enquiries: st.enquiries.map((e) =>
            e.id === st.enquiry?.id ? { ...e, ...patch } : e
          ),
        })),

      startEditPickup: () => {
        const st = get();
        if (!st.enquiry) return;
        set({
          editingEnquiry: true,
          checkout: {
            address: st.enquiry.address,
            pincode: st.enquiry.pincode,
            slot: st.enquiry.slot,
            pay: st.enquiry.pay,
          },
        });
      },

      updateEnquiryPickup: () => {
        const st = get();
        if (!st.enquiry) return;
        const c = st.checkout;
        const updated: Enquiry = {
          ...st.enquiry,
          address: c.address,
          pincode: c.pincode,
          slot: c.slot ?? st.enquiry.slot,
          pay: c.pay ?? st.enquiry.pay,
          history: [{ ts: new Date().toISOString(), action: "Customer updated pickup details" }, ...st.enquiry.history],
        };
        set({
          enquiry: updated,
          enquiries: st.enquiries.map((e) => (e.id === updated.id ? updated : e)),
          checkout: { ...emptyCheckout },
          editingEnquiry: false,
        });
      },

      cancelEnquiry: () => {
        const st = get();
        if (!st.enquiry) return;
        const updated: Enquiry = {
          ...st.enquiry,
          status: "cancelled",
          history: [{ ts: new Date().toISOString(), action: "Cancelled by customer" }, ...st.enquiry.history],
        };
        set({
          enquiry: updated,
          enquiries: st.enquiries.map((e) => (e.id === updated.id ? updated : e)),
        });
      },

      rateEnquiry: (rating) => {
        const st = get();
        if (!st.enquiry) return;
        const updated = { ...st.enquiry, rating };
        set({
          enquiry: updated,
          enquiries: st.enquiries.map((e) => (e.id === updated.id ? updated : e)),
        });
      },

      advanceTracking: () => {
        const st = get();
        if (!st.enquiry || st.enquiry.step >= TRACK_STEPS.length - 1) return false;
        const nextStep = st.enquiry.step + 1;
        const updated = { ...st.enquiry, step: nextStep };
        set({
          enquiry: updated,
          enquiries: st.enquiries.map((e) => (e.id === updated.id ? updated : e)),
        });
        return true;
      },

      markStepSeen: () => {
        const st = get();
        if (st.enquiry) set({ lastSeenStep: st.enquiry.step });
      },

      toggleSetting: (key) => set((st) => ({ settings: { ...st.settings, [key]: !st.settings[key] } })),
      setLanguage: (language) => set((st) => ({ settings: { ...st.settings, language } })),

      updateEnquiry: (id, patch, action) =>
        set((st) => {
          const map = (e: Enquiry): Enquiry => {
            if (e.id !== id) return e;
            const merged = { ...e, ...patch };
            if (action) merged.history = [{ ts: new Date().toISOString(), action }, ...e.history];
            return merged;
          };
          return {
            enquiries: st.enquiries.map(map),
            enquiry: st.enquiry?.id === id ? map(st.enquiry) : st.enquiry,
          };
        }),

      deleteEnquiry: (id) =>
        set((st) => ({
          enquiries: st.enquiries.filter((e) => e.id !== id),
          enquiry: st.enquiry?.id === id ? null : st.enquiry,
        })),

      bulkUpdateStatus: (ids, status) =>
        set((st) => ({
          enquiries: st.enquiries.map((e) =>
            ids.includes(e.id)
              ? { ...e, status, history: [{ ts: new Date().toISOString(), action: `Bulk updated to ${status}` }, ...e.history] }
              : e
          ),
        })),

      bulkDelete: (ids) =>
        set((st) => ({ enquiries: st.enquiries.filter((e) => !ids.includes(e.id)) })),

      saveModel: (model, existingId) =>
        set((st) => {
          if (existingId) {
            return { models: st.models.map((m) => (m.id === existingId ? { ...model, id: existingId } : m)) };
          }
          const newId =
            model.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
            "-" +
            Math.floor(Math.random() * 1000);
          return { models: [...st.models, { ...model, id: newId }] };
        }),

      deleteModel: (id) => set((st) => ({ models: st.models.filter((m) => m.id !== id) })),

      saveQuestion: (q, index) =>
        set((st) => {
          if (index !== null && index !== undefined) {
            return { questions: st.questions.map((existing, i) => (i === index ? q : existing)) };
          }
          return { questions: [...st.questions, q] };
        }),

      deleteQuestion: (index) =>
        set((st) => ({ questions: st.questions.filter((_, i) => i !== index) })),
    }),
    {
      name: "sellmyiphone",
      partialize: (st) => ({
        // Only persist the fields actually needed across page reloads.
        // models, questions, enquiries are intentionally excluded:
        //   - models/questions come from Supabase via TanStack Query (live data)
        //   - enquiries (all-time list) is not needed in localStorage; admin reads from Supabase
        // Keeping these out cuts localStorage from ~100KB to ~2KB.
        user:            st.user,
        enquiry:         st.enquiry,          // current in-flight sell enquiry
        cart:            st.cart,             // multi-device cart
        selectedModelId: st.selectedModelId,  // resume sell flow after login
        selectedStorage: st.selectedStorage,
        answers:         st.answers,
        activeQuestions: st.activeQuestions,  // keep quote calc aligned across reloads
        quote:           st.quote,
        photos:          st.photos,
        settings:        st.settings,
        lastSeenStep:    st.lastSeenStep,
      }),
    }
  )
);

/** Convenience selector for the active model object. */
export function useActiveModel() {
  return useStore((s) => (s.selectedModelId ? s.models.find((m) => m.id === s.selectedModelId) : undefined));
}

/** Resume-draft computation for the home banner. */
export function resumeInfo(state: AppState): { href: string; text: string } | null {
  const { selectedModelId, enquiry, quote, photos, models } = state;
  if (!selectedModelId || enquiry) return null;
  const m = models.find((x) => x.id === selectedModelId);
  if (!m) return null;
  if (!quote) return { href: "/sell/condition", text: `Continue your condition check for ${m.name}` };
  return { href: "/sell/quote", text: `Finish your quote for ${m.name}` };
}
