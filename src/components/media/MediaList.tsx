import { useMemo, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Film,
  Tv2,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import {
  useMedia,
  applyMediaFilters,
  type MediaSortKey,
} from "../../store/mediaStore";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";
import {
  MEDIA_STATUSES,
  MEDIA_STATUS_TONE,
} from "../../constants/mediaStatuses";
import { FILM_COLUMN_LABELS, TV_COLUMN_LABELS } from "../../constants/columns";
import { MediaStatusBadge, GenreChip } from "../ui/Badge";
import { MediaCard } from "./MediaCard";
import type { Media, MediaStatus, MediaType } from "../../types/media";
import { cn } from "../../lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useResponsiveColumns } from "../../lib/virtual";
import { useIndexedMediaIds } from "../../lib/indexedQueries";
import { groupByPrimaryTag } from "../../lib/tagGrouping";

interface Props {
  type: MediaType;
  onOpen: (m: Media) => void;
}

type MediaVirtualUnit =
  | {
      key: string;
      kind: "group";
      label: string;
      color?: string;
      count: number;
    }
  | { key: string; kind: "items"; items: Media[] };

const NEXT_STATUS: Partial<Record<MediaStatus, MediaStatus>> = {
  izlenecek: "izlendi",
};

const NEXT_LABEL: Partial<Record<MediaStatus, string>> = {
  izlenecek: "→ İzlendi ✓",
};

export function MediaList({ type, onOpen }: Props) {
  const {
    media,
    filters,
    setSort,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    clearFilters,
    remove,
    setStatus,
  } = useMedia();
  const { sortKey, sortDir } = filters[type];
  const groupByTags = filters[type].groupByTags;
  const tags = useTags((state) => state.tags);
  const indexedIds = useIndexedMediaIds(
    media,
    type,
    filters[type].statusFilter,
    filters[type].genreFilter,
  );
  const { view, density, filmColumns, tvColumns } = useSettings();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardColumns = useResponsiveColumns();

  const columns = type === "film" ? filmColumns : tvColumns;
  const visibleCols = useMemo(
    () => columns.filter((c) => c.visible),
    [columns],
  );

  const filtered = useMemo(
    () =>
      applyMediaFilters(
        indexedIds ? media.filter((item) => indexedIds.has(item.id)) : media,
        type,
        filters[type],
      ),
    [filters, indexedIds, media, type],
  );
  const tagGroups = useMemo(
    () =>
      groupByTags
        ? groupByPrimaryTag(filtered, tags)
        : [{ id: "all", label: "", items: filtered }],
    [filtered, groupByTags, tags],
  );
  const virtualRows = useMemo<MediaVirtualUnit[]>(
    () =>
      tagGroups.flatMap((group) => {
        const units: MediaVirtualUnit[] = groupByTags
          ? [
              {
                key: `group:${group.id}`,
                kind: "group",
                label: group.label,
                color: group.color,
                count: group.items.length,
              },
            ]
          : [];
        if (view === "card") {
          for (
            let index = 0;
            index < group.items.length;
            index += cardColumns
          ) {
            units.push({
              key: `cards:${group.id}:${index}`,
              kind: "items",
              items: group.items.slice(index, index + cardColumns),
            });
          }
        } else {
          group.items.forEach((item) =>
            units.push({
              key: `media:${item.id}`,
              kind: "items",
              items: [item],
            }),
          );
        }
        return units;
      }),
    [cardColumns, groupByTags, tagGroups, view],
  );
  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      virtualRows[index]?.kind === "group"
        ? 38
        : view === "card"
          ? 320
          : density === "compact"
            ? 52
            : 56,
    getItemKey: (index) => virtualRows[index]?.key ?? index,
    overscan: 8,
  });

  const allSelected =
    filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const hasSel = selectedIds.size > 0;
  const typeLabel = type === "film" ? "film" : "dizi";
  const TypeIcon = type === "film" ? Film : Tv2;

  if (filtered.length === 0) {
    const isFiltered = media.some((m) => m.type === type);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
            {isFiltered ? <SearchX size={24} /> : <TypeIcon size={24} />}
          </div>
          <h3 className="font-semibold mb-1">
            {isFiltered ? "Sonuç bulunamadı" : `Henüz ${typeLabel} yok`}
          </h3>
          <p className="text-sm text-mute max-w-xs">
            {isFiltered
              ? `Arama veya filtrelerle eşleşen ${typeLabel} yok.`
              : `Sağ üstten ${typeLabel} ekleyebilir, Excel/CSV/JSON dosyasından içe aktarabilirsin.`}
          </p>
          {isFiltered && (
            <button
              className="btn btn-outline mt-4"
              onClick={() => clearFilters(type)}
            >
              <X size={14} /> Filtreleri Temizle
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto">
      {hasSel && (
        <BulkBar
          count={selectedIds.size}
          onClear={clearSelection}
          onDelete={() => remove([...selectedIds])}
          onStatus={(s) => setStatus([...selectedIds], s)}
        />
      )}

      {view === "card" ? (
        <div className="p-5">
          <div
            className="relative"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((row) => {
              const unit = virtualRows[row.index];
              return unit.kind === "group" ? (
                <div
                  key={unit.key}
                  ref={virtualizer.measureElement}
                  data-index={row.index}
                  className="absolute left-0 top-0 w-full pb-2"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
                  <TagGroupHeader
                    label={unit.label}
                    color={unit.color}
                    count={unit.count}
                  />
                </div>
              ) : (
                <div
                  key={unit.key}
                  ref={virtualizer.measureElement}
                  data-index={row.index}
                  className="absolute left-0 top-0 grid w-full grid-cols-1 gap-3 pb-3 sm:grid-cols-2 xl:grid-cols-3"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
                  {unit.items.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onClick={() => onOpen(item)}
                      selected={selectedIds.has(item.id)}
                      onToggleSelect={() => toggleSelect(item.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="card overflow-hidden">
            <table className="w-full table-fixed text-sm">
              <thead className="sticky top-0 z-10 bg-panel text-mute text-xs uppercase tracking-wider border-b border-line-strong">
                <tr>
                  <th className="w-10 px-3 py-3.5 text-left">
                    <input
                      type="checkbox"
                      className="row-check"
                      aria-label={`Gösterilen ${typeLabel} kayıtlarının tümünü seç`}
                      checked={allSelected}
                      onChange={() =>
                        allSelected
                          ? clearSelection()
                          : selectAll(filtered.map((m) => m.id))
                      }
                    />
                  </th>
                  {visibleCols.map((col) => (
                    <ThSort
                      key={col.key}
                      label={COL_LABELS[col.key] ?? col.key}
                      k={col.key as MediaSortKey}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onClick={(key) => setSort(type, key)}
                      align={
                        [
                          "releaseYear",
                          "watchYear",
                          "duration",
                          "seasons",
                          "episodeDuration",
                        ].includes(col.key)
                          ? "right"
                          : undefined
                      }
                      width={COL_WIDTH[col.key]}
                    />
                  ))}
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {virtualizer.getVirtualItems()[0]?.start > 0 && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={visibleCols.length + 2}
                      style={{ height: virtualizer.getVirtualItems()[0].start }}
                    />
                  </tr>
                )}
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const unit = virtualRows[virtualRow.index];
                  if (unit.kind === "group") {
                    return (
                      <tr
                        key={unit.key}
                        ref={virtualizer.measureElement}
                        data-index={virtualRow.index}
                      >
                        <td
                          colSpan={visibleCols.length + 2}
                          className="bg-hover/70 px-3 py-2"
                        >
                          <TagGroupHeader
                            label={unit.label}
                            color={unit.color}
                            count={unit.count}
                          />
                        </td>
                      </tr>
                    );
                  }
                  const m = unit.items[0];
                  return (
                    <tr
                      key={m.id}
                      ref={virtualizer.measureElement}
                      data-index={virtualRow.index}
                      tabIndex={0}
                      className={cn(
                        "group cursor-pointer border-b border-line transition-colors hover:bg-hover",
                        virtualRow.index % 2 === 0 ? "bg-row" : "bg-row-alt",
                        density === "compact" ? "text-[13px]" : "",
                      )}
                      onClick={() => onOpen(m)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpen(m);
                        }
                      }}
                    >
                      <td
                        className="px-3 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="row-check"
                          aria-label={`${m.title} seç`}
                          checked={selectedIds.has(m.id)}
                          onChange={() => toggleSelect(m.id)}
                        />
                      </td>
                      {visibleCols.map((col) =>
                        renderCell(m, col.key, density),
                      )}
                      <td className="pr-3" onClick={(e) => e.stopPropagation()}>
                        {NEXT_STATUS[m.status] && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-lg bg-hover hover:bg-accent-soft hover:text-accent whitespace-nowrap"
                            onClick={() =>
                              setStatus([m.id], NEXT_STATUS[m.status]!)
                            }
                          >
                            {NEXT_LABEL[m.status]}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {virtualizer.getVirtualItems().at(-1) && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={visibleCols.length + 2}
                      style={{
                        height: Math.max(
                          0,
                          virtualizer.getTotalSize() -
                            virtualizer.getVirtualItems().at(-1)!.end,
                        ),
                      }}
                    />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-mute">
            {filtered.length} {typeLabel} gösteriliyor
          </div>
        </div>
      )}
    </div>
  );
}

const COL_LABELS: Record<string, string> = {
  ...FILM_COLUMN_LABELS,
  ...TV_COLUMN_LABELS,
};

const EMPTY = <span className="text-mute select-none">—</span>;

function TagGroupHeader({
  label,
  color,
  count,
}: {
  label: string;
  color?: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mute">
      <span
        className="h-2.5 w-2.5 rounded-full border border-line"
        style={{ backgroundColor: color ?? "transparent" }}
      />
      <span>{label}</span>
      <span className="font-normal normal-case">· {count} kayıt</span>
    </div>
  );
}

function renderCell(m: Media, key: string, density: string) {
  const py = density === "compact" ? "py-2" : "py-3.5";
  switch (key) {
    case "title":
      return (
        <td key={key} className={cn("px-4", py, "font-medium")}>
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-[3px] h-4 rounded-full shrink-0",
                MEDIA_STATUS_TONE[m.status].dot,
              )}
            />
            {m.title}
          </div>
        </td>
      );
    case "director":
      return (
        <td key={key} className={cn("px-4", py, "text-mute")}>
          {m.director || EMPTY}
        </td>
      );
    case "genre":
      return (
        <td key={key} className={cn("px-4", py)}>
          {m.genre ? <GenreChip genre={m.genre} /> : EMPTY}
        </td>
      );
    case "releaseYear":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {m.releaseYear ?? EMPTY}
        </td>
      );
    case "duration":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {m.duration ? `${m.duration} dk` : EMPTY}
        </td>
      );
    case "seasons":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {m.seasons ?? EMPTY}
        </td>
      );
    case "episodeDuration":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {m.episodeDuration ? `${m.episodeDuration} dk` : EMPTY}
        </td>
      );
    case "watchYear":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {m.watchYear ?? EMPTY}
        </td>
      );
    case "status":
      return (
        <td key={key} className={cn("px-4", py)}>
          <MediaStatusBadge status={m.status} />
        </td>
      );
    default:
      return null;
  }
}

/**
 * Sütun genişlikleri. Metin sütunları oranla esner (Başlık 2fr, Yazar ve
 * Yayınevi 1.4fr), sayı ve rozet sütunları içeriklerine göre sabit kalır.
 */
const COL_WIDTH: Record<string, string> = {
  title: "w-[34%]",
  author: "w-[24%]",
  publisher: "w-[24%]",
  pageCount: "w-24",
  publicationYear: "w-24",
  rating: "w-28",
  releaseYear: "w-24",
  duration: "w-24",
  seasons: "w-24",
  episodeDuration: "w-28",
  watchYear: "w-24",
  status: "w-44",
  genre: "w-40",
  director: "w-[24%]",
};

function ThSort({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  align,
  width,
}: {
  label: string;
  k: MediaSortKey;
  sortKey: MediaSortKey;
  sortDir: "asc" | "desc";
  onClick: (k: MediaSortKey) => void;
  align?: "right";
  width?: string;
}) {
  const active = sortKey === k;
  return (
    <th
      className={cn(
        "px-4 py-3.5 font-semibold",
        width,
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <button
        onClick={() => onClick(k)}
        className="inline-flex items-center gap-1 hover:text-text"
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp size={12} className="text-accent" />
          ) : (
            <ArrowDown size={12} className="text-accent" />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

function BulkBar({
  count,
  onClear,
  onDelete,
  onStatus,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onStatus: (s: MediaStatus) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-accent-soft border-b border-line-strong px-5 py-2 flex items-center gap-3 text-sm flex-wrap">
      <span className="font-medium text-accent shrink-0">{count} seçili</span>

      <div className="w-px h-4 bg-accent/20 shrink-0" />

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-mute text-xs shrink-0">Durum:</span>
        {MEDIA_STATUSES.map((s) => (
          <button
            key={s.value}
            className="chip hover:bg-accent/20 text-xs"
            onClick={() => onStatus(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="btn btn-ghost text-warn" onClick={onDelete}>
          <Trash2 size={14} /> Sil
        </button>
        <button className="btn btn-ghost" onClick={onClear}>
          Seçimi Kaldır
        </button>
      </div>
    </div>
  );
}
