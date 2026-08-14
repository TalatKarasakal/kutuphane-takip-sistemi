import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import type { StatusTone } from "../../constants/statuses";

/**
 * Kitap ve medya kenar çubuklarının ortak filtre kabuğu. İki çubuk aynı
 * görünümü kopyalıyordu; düzen tek yerde tutulsun diye ayrıldı.
 *
 * Her grup kendi kabında durur ve sınırı görünür — kenar çubuğuyla aynı
 * zeminde kaldığında kutular birbirine karışıyordu.
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
    <section className="filter-group">
      <div className="flex items-center gap-2 px-2.5 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-mute">
        {/* Başlığın solundaki çubuk metin taşımıyor; saf işaret tonunu alır. */}
        <span className="h-3 w-0.5 shrink-0 rounded-full bg-accent" />
        {icon}
        <span>{title}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function FilterRow({
  active,
  tone,
  onClick,
  label,
  count,
  title,
  color,
}: {
  active: boolean;
  /** Durum satırlarında satırın kendi rengi; nokta olarak gösterilir. */
  tone?: StatusTone;
  onClick: () => void;
  label: string;
  count: number;
  title?: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn("filter-item", active && "is-active")}
      aria-pressed={active}
    >
      <span className="flex min-w-0 items-center gap-2">
        {tone && (
          <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
        )}
        {color && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span className="filter-count text-xs">{count}</span>
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
    <div className="px-4 pt-4 pb-1">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"
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
