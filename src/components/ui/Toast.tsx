import { CheckCircle2, AlertCircle, Info, X, Undo2 } from "lucide-react";
import { useToast } from "../../store/toastStore";
import { cn } from "../../lib/utils";

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info };
const ICON_CLASS = {
  success: "text-success",
  error: "text-warn",
  info: "text-accent",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Bildirimler"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICON[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-panel shadow-lg text-sm min-w-[260px] max-w-sm",
              "animate-in slide-in-from-right-4 fade-in duration-200",
            )}
          >
            <Icon size={16} className={cn("shrink-0", ICON_CLASS[t.type])} />
            <span className="flex-1">{t.message}</span>
            {t.undo && (
              <button
                className="shrink-0 text-accent hover:underline text-xs font-medium flex items-center gap-1"
                onClick={() => {
                  t.undo!();
                  dismiss(t.id);
                }}
              >
                <Undo2 size={12} /> Geri Al
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-mute hover:text-text"
              aria-label="Bildirimi kapat"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
