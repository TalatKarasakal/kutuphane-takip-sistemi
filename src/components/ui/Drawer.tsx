import { useId, useRef } from "react";
import { X } from "lucide-react";
import { useOverlay } from "../../lib/overlay";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({ open, onClose, title, children, footer }: Props) {
  const drawerRef = useRef<HTMLElement>(null);
  const titleId = useId();
  useOverlay(open, onClose, drawerRef);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-40" data-overlay-open>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-panel border-l border-line shadow-elev1 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-line">
          <h3 id={titleId} className="text-base font-semibold">
            {title}
          </h3>
          <button
            className="btn btn-ghost p-1.5"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
