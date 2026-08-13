import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface MenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  /** Üstüne ince bir ayraç çizer; ikincil eylemleri gruplamak için. */
  separatorBefore?: boolean;
}

interface Props {
  /** Tetikleyici butonun içeriği (ikon ve/veya yazı). */
  trigger: ReactNode;
  triggerClassName?: string;
  /** Ekran okuyucu ve tooltip metni. */
  title: string;
  items: MenuAction[];
  align?: "left" | "right";
}

/**
 * Butona tutturulmuş küçük eylem menüsü. Ana sayfada yer kaplamaması gereken
 * ikincil eylemleri (fotoğraftan ekle, içe/dışa aktar) barındırır.
 */
export function MenuButton({
  trigger,
  triggerClassName,
  title,
  items,
  align = "right",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const moveFocus = (from: HTMLElement, step: 1 | -1) => {
    const buttons = [
      ...(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []),
    ];
    const next = buttons[buttons.indexOf(from as HTMLButtonElement) + step];
    (next ?? (step === 1 ? buttons[0] : buttons.at(-1)))?.focus();
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={triggerClassName}
        data-open={open}
        title={title}
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={title}
          className={cn(
            "absolute top-full mt-1 z-50 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {item.separatorBefore && (
                  <div className="my-1.5 h-px bg-border" />
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface2 focus:bg-surface2 focus:outline-none"
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, 1);
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, -1);
                    }
                  }}
                >
                  <Icon size={15} className="shrink-0 text-muted" />
                  <span className="truncate">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
