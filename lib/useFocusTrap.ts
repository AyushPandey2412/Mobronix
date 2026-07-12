"use client";

import { useEffect, useRef } from "react";

/**
 * Accessibility helper for dialogs/sheets. When `open`:
 *  - moves focus into the dialog (first focusable, else the container),
 *  - keeps Tab/Shift-Tab cycling WITHIN the dialog (focus trap),
 *  - restores focus to the previously-focused element on close.
 * Attach the returned ref to the dialog container element.
 */
export function useFocusTrap<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;
    const prevActive = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    // Move focus into the dialog — prefer an explicit [data-autofocus] target
    // (e.g. a phone input), otherwise the first focusable, otherwise the dialog.
    const preferred = node.querySelector<HTMLElement>("[data-autofocus]");
    const first = preferred ?? focusables()[0];
    if (first) {
      first.focus({ preventScroll: true });
    } else {
      node.setAttribute("tabindex", "-1");
      node.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = f[0];
      const lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      // Restore focus to what was focused before the dialog opened.
      prevActive?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
