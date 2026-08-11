import { useEffect, useRef, type RefObject } from "react";

let overlayStack: string[] = [];

function syncBackground() {
  const background = document.querySelector<HTMLElement>("[data-app-content]");
  if (!background) return;
  const blocked = overlayStack.length > 0;
  background.inert = blocked;
  if (blocked) background.setAttribute("aria-hidden", "true");
  else background.removeAttribute("aria-hidden");
  document.body.dataset.overlayCount = String(overlayStack.length);
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useOverlay(
  open: boolean,
  onClose: () => void,
  container: RefObject<HTMLElement | null>,
) {
  const id = useRef(crypto.randomUUID());
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const overlayId = id.current;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    overlayStack = [...overlayStack, overlayId];
    syncBackground();

    const frame = requestAnimationFrame(() => {
      const initial = container.current?.querySelector<HTMLElement>(
        "[data-initial-focus]",
      );
      const focusable =
        container.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (initial ?? focusable?.[0] ?? container.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (overlayStack.at(-1) !== overlayId) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...(container.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ].filter(
        (element) => !element.hidden && element.getClientRects().length > 0,
      );
      if (!focusable.length) {
        event.preventDefault();
        container.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown, true);
      overlayStack = overlayStack.filter((item) => item !== overlayId);
      syncBackground();
      if (previous?.isConnected) previous.focus();
    };
  }, [container, open]);
}
