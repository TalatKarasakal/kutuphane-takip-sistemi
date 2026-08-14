import { cn } from "../../lib/utils";
import type { StatusTone } from "../../constants/statuses";

/**
 * Kitap ve medya kenar çubuklarının ortak filtre kabuğu. İki çubuk aynı
 * görünümü kopyalıyordu; renk düzeni tek yerde tutulsun diye ayrıldı.
 */
export function FilterCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface2/40 overflow-hidden">
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        <span>{title}</span>
      </div>
      <div className="border-t border-border/70" />
      <div className="p-1">{children}</div>
    </section>
  );
}

export function FilterRow({
  first,
  active,
  accent,
  tone,
  onClick,
  label,
  count,
  share,
  title,
  color,
}: {
  first?: boolean;
  active: boolean;
  accent?: "primary" | "secondary";
  /** Durum satırlarında satırın kendi rengi; verilmezse accent kullanılır. */
  tone?: StatusTone;
  onClick: () => void;
  label: string;
  count: number;
  /** 0–1 arası pay; verilirse satırın altında ince bir oran çubuğu çizilir. */
  share?: number;
  title?: string;
  color?: string;
}) {
  const activeClass = tone
    ? cn(tone.tint, "font-medium")
    : accent === "secondary"
      ? "bg-secondary/10 text-secondary font-medium"
      : "bg-primary/10 text-primary font-medium";
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "relative w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
        !first && "border-t border-border/60",
        active ? activeClass : "hover:bg-surface2 text-text",
      )}
    >
      {/* Seçili satırın sol kenarında renk çubuğu: hangi filtrenin açık olduğu
          göz gezdirirken de fark edilsin. */}
      {active && (
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-0.5",
            tone
              ? tone.dot
              : accent === "secondary"
                ? "bg-secondary"
                : "bg-primary",
          )}
        />
      )}
      <span className="flex items-center gap-2">
        {tone && (
          <span className={cn("h-2 w-2 rounded-full shrink-0", tone.dot)} />
        )}
        {color && (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span
        className={cn(
          "text-xs tabular-nums",
          active ? "opacity-80" : "text-muted",
        )}
      >
        {count}
      </span>
      {/* Sayının yanına payı da koymak, koleksiyonun hangi durumda yığıldığını
          tek bakışta gösteriyor. */}
      {share != null && share > 0 && tone && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent"
        >
          <span
            className={cn("block h-full opacity-60", tone.dot)}
            style={{ width: `${Math.min(100, share * 100)}%` }}
          />
        </span>
      )}
    </button>
  );
}

/** Kenar çubuğu başlığı: paletin iki vurgu ailesinden geçen ince renk alanı. */
export function SidebarHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-soft shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold leading-tight truncate">{title}</div>
        <div className="text-xs text-muted truncate">{subtitle}</div>
      </div>
    </div>
  );
}
