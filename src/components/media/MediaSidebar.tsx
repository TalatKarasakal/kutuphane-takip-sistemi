import { useMemo } from "react";
import { Film, Filter, Layers3, Tags, Tv2, X } from "lucide-react";
import { useMedia } from "../../store/mediaStore";
import { useTags } from "../../store/tagsStore";
import { MEDIA_STATUSES } from "../../constants/mediaStatuses";
import type { MediaType } from "../../types/media";
import { cn } from "../../lib/utils";

interface Props {
  type: MediaType;
}

export function MediaSidebar({ type }: Props) {
  const {
    media,
    filters,
    toggleStatusFilter,
    toggleGenreFilter,
    toggleTagFilter,
    setTagFilterMode,
    toggleGroupByTags,
    clearFilters,
  } = useMedia();
  const tags = useTags((state) => state.tags);
  const { statusFilter, genreFilter, tagFilter, tagFilterMode, groupByTags } =
    filters[type];

  const items = useMemo(
    () => media.filter((m) => m.type === type),
    [media, type],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((m) => {
      c[m.status] = (c[m.status] ?? 0) + 1;
    });
    return c;
  }, [items]);

  const activeGenres = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((m) => {
      if (m.genre) c[m.genre] = (c[m.genre] ?? 0) + 1;
    });
    return Object.entries(c).sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [items]);

  const hasActive =
    statusFilter.length > 0 ||
    genreFilter.length > 0 ||
    tagFilter.length > 0 ||
    groupByTags;
  const typeLabel = type === "film" ? "film" : "dizi";
  const TypeIcon = type === "film" ? Film : Tv2;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <TypeIcon size={18} />
        </div>
        <div>
          <div className="font-semibold leading-tight capitalize">
            {typeLabel === "film" ? "Filmlerim" : "Dizilerim"}
          </div>
          <div className="text-xs text-muted">
            {items.length} {typeLabel}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex-1 overflow-auto space-y-3">
        {hasActive && (
          <div className="flex justify-end">
            <button
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => clearFilters(type)}
            >
              <X size={12} /> filtreleri temizle
            </button>
          </div>
        )}

        <FilterCard title="Durum">
          {MEDIA_STATUSES.map((s, i) => {
            const active = statusFilter.includes(s.value);
            return (
              <FilterRow
                key={s.value}
                first={i === 0}
                active={active}
                accent="primary"
                onClick={() => toggleStatusFilter(type, s.value)}
                label={s.label}
                count={counts[s.value] ?? 0}
              />
            );
          })}
        </FilterCard>

        {tags.length > 0 && (
          <FilterCard title="Etiketler" icon={<Tags size={12} />}>
            <div className="flex justify-end gap-1 px-2 pb-1">
              {(["or", "and"] as const).map((mode) => (
                <button
                  key={mode}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    tagFilterMode === mode
                      ? "bg-primary text-white"
                      : "bg-surface text-muted",
                  )}
                  onClick={() => setTagFilterMode(type, mode)}
                  aria-pressed={tagFilterMode === mode}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
            {tags.map((tag, index) => (
              <FilterRow
                key={tag.id}
                first={index === 0}
                active={tagFilter.includes(tag.id)}
                accent="primary"
                onClick={() => toggleTagFilter(type, tag.id)}
                label={tag.name}
                count={
                  items.filter((item) => item.tagIds?.includes(tag.id)).length
                }
                color={tag.color}
              />
            ))}
            <button
              className={cn(
                "mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs",
                groupByTags
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface2",
              )}
              onClick={() => toggleGroupByTags(type)}
              aria-pressed={groupByTags}
            >
              <Layers3 size={12} /> Etikete göre grupla
            </button>
          </FilterCard>
        )}

        <FilterCard title="Tür" icon={<Filter size={12} />}>
          {activeGenres.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted italic">
              Henüz tür eklenmemiş
            </div>
          ) : (
            activeGenres.map(([g, count], i) => (
              <FilterRow
                key={g}
                first={i === 0}
                active={genreFilter.includes(g)}
                accent="secondary"
                onClick={() => toggleGenreFilter(type, g)}
                label={g}
                count={count}
              />
            ))
          )}
        </FilterCard>
      </div>
    </aside>
  );
}

function FilterCard({
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

function FilterRow({
  first,
  active,
  accent,
  onClick,
  label,
  count,
  color,
}: {
  first?: boolean;
  active: boolean;
  accent: "primary" | "secondary";
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
        !first && "border-t border-border/60",
        active
          ? accent === "primary"
            ? "bg-primary/10 text-primary font-medium"
            : "bg-secondary/10 text-secondary font-medium"
          : "hover:bg-surface2 text-text",
      )}
    >
      <span className="flex items-center gap-2">
        {color && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="text-xs text-muted">{count}</span>
    </button>
  );
}
