import { useMemo } from "react";
import { Film, Filter, Layers3, Tags, Tv2, X } from "lucide-react";
import { useMedia } from "../../store/mediaStore";
import { useTags } from "../../store/tagsStore";
import { MEDIA_STATUSES } from "../../constants/mediaStatuses";
import type { MediaType } from "../../types/media";
import { cn } from "../../lib/utils";
import { FilterCard, FilterRow, SidebarHeader } from "../layout/FilterPanel";

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
      <SidebarHeader
        icon={<TypeIcon size={18} />}
        title={typeLabel === "film" ? "Filmlerim" : "Dizilerim"}
        subtitle={`${items.length} ${typeLabel}`}
      />

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
          {MEDIA_STATUSES.map((s, i) => (
            <FilterRow
              key={s.value}
              first={i === 0}
              active={statusFilter.includes(s.value)}
              tone={s.tone}
              onClick={() => toggleStatusFilter(type, s.value)}
              label={s.label}
              count={counts[s.value] ?? 0}
              share={items.length ? (counts[s.value] ?? 0) / items.length : 0}
            />
          ))}
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
