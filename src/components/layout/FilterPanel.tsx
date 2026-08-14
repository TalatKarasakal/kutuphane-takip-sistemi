import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import type { StatusTone } from "../../constants/statuses";

/**
 * Kitap ve medya kenar çubuklarının ortak filtre kabuğu. İki çubuk aynı
 * görünümü kopyalıyordu; renk düzeni tek yerde tutulsun diye ayrıldı.
 */
/** Filtre kutusunun renk kimliği; başlıktaki çubuk ve simgeyi boyar. */
export type CardTone = "primary" | "accent" | "secondary" | "warm";

const CARD_TONE: Record<CardTone, { bar: string; icon: string }> = {
  primary: { bar: "bg-primary", icon: "text-primary" },
  accent: { bar: "bg-accent", icon: "text-accent" },
  secondary: { bar: "bg-secondary", icon: "text-secondary" },
  warm: { bar: "bg-kemik-600", icon: "text-kemik-700 dark:text-kemik-400" },
};

export function FilterCard({
  title,
  icon,
  tone = "primary",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  tone?: CardTone;
  children: React.ReactNode;
}) {
  const t = CARD_TONE[tone];
  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden shadow-soft">
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {/* Her kutunun kendi renk çubuğu var; kenar çubuğu tek tonlu bir yığın
            olmaktan çıkıyor ve kutular göz gezdirirken ayrışıyor. */}
        <span className={cn("h-3 w-0.5 rounded-full shrink-0", t.bar)} />
        {icon && <span className={t.icon}>{icon}</span>}
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

/**
 * Kenar çubuğunun tepesindeki arama alanı. Arama, filtrelerin hemen üstünde
 * durması için üst çubuktan buraya alındı; uygulama kimliği üst çubuğa geçti.
 */
export function SidebarSearch({
  value,
  onChange,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  return (
    // Ayraç yok: arama da filtreler de aynı panelin üstünde duruyor, araya
    // çizgi koymak iki yakın tonu birbirinden ayırmıyor, yalnız gürültü katıyordu.
    <div className="px-4 pt-4 pb-1">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={15}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input pl-9 text-sm"
        />
      </div>
    </div>
  );
}
