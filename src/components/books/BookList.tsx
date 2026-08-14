import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  SearchX,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useBooks, type SortKey } from "../../store/booksStore";
import { useLoans } from "../../store/loansStore";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";
import { applyFilters } from "../../lib/filters";
import { STATUSES, STATUS_TONE } from "../../constants/statuses";
import { BOOK_COLUMN_LABELS } from "../../constants/columns";
import { StatusBadge, GenreChip } from "../ui/Badge";
import { BookCard } from "./BookCard";
import { LoanDialog } from "./LoanDialog";
import type { Book, BookStatus } from "../../types/book";
import { cn } from "../../lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useResponsiveColumns } from "../../lib/virtual";
import { useIndexedBookIds } from "../../lib/indexedQueries";
import { groupByPrimaryTag } from "../../lib/tagGrouping";

interface Props {
  onOpen: (b: Book) => void;
}

type BookVirtualUnit =
  | {
      key: string;
      kind: "group";
      label: string;
      color?: string;
      count: number;
    }
  | { key: string; kind: "items"; items: Book[] };

const NEXT_STATUS: Partial<Record<BookStatus, BookStatus>> = {
  "satin-alinacak": "mevcut",
  mevcut: "okunacak",
  okunacak: "okundu",
};

const NEXT_LABEL: Partial<Record<BookStatus, string>> = {
  "satin-alinacak": "→ Mevcut",
  mevcut: "→ Okunacak",
  okunacak: "→ Okundu ✓",
};

export function BookList({ onOpen }: Props) {
  const {
    books,
    search,
    statusFilter,
    genreFilter,
    tagFilter,
    tagFilterMode,
    groupByTags,
    duplicatesOnly,
    loansOnly,
    sortKey,
    sortDir,
    setSort,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    clearFilters,
    remove,
    setStatus,
    setGenre,
    setPublisher,
  } = useBooks();
  const loans = useLoans((state) => state.loans);
  const tags = useTags((state) => state.tags);
  const { view, density, bookColumns } = useSettings();
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardColumns = useResponsiveColumns();
  const loanIds = useMemo(
    () => new Set(loans.map((loan) => loan.bookId)),
    [loans],
  );
  const indexedIds = useIndexedBookIds(books, statusFilter, genreFilter);

  const filtered = useMemo(
    () =>
      applyFilters(
        indexedIds ? books.filter((book) => indexedIds.has(book.id)) : books,
        {
          search,
          statusFilter,
          genreFilter,
          tagFilter,
          tagFilterMode,
          duplicatesOnly,
          loansOnly,
          loanIds,
          sortKey,
          sortDir,
        },
      ),
    [
      books,
      indexedIds,
      search,
      statusFilter,
      genreFilter,
      tagFilter,
      tagFilterMode,
      duplicatesOnly,
      loansOnly,
      loanIds,
      sortKey,
      sortDir,
    ],
  );

  const allSelected =
    filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));
  const hasSel = selectedIds.size > 0;
  const visibleCols = useMemo(
    () => bookColumns.filter((c) => c.visible),
    [bookColumns],
  );
  const tagGroups = useMemo(
    () =>
      groupByTags
        ? groupByPrimaryTag(filtered, tags)
        : [{ id: "all", label: "", items: filtered }],
    [filtered, groupByTags, tags],
  );
  const virtualRows = useMemo<BookVirtualUnit[]>(
    () =>
      tagGroups.flatMap((group) => {
        const units: BookVirtualUnit[] = groupByTags
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
          group.items.forEach((book) =>
            units.push({
              key: `book:${book.id}`,
              kind: "items",
              items: [book],
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

  const allGenres = useMemo(
    () =>
      [...new Set(books.map((b) => b.genre).filter(Boolean) as string[])].sort(
        (a, b) => a.localeCompare(b, "tr"),
      ),
    [books],
  );
  const allPublishers = useMemo(
    () =>
      [
        ...new Set(books.map((b) => b.publisher).filter(Boolean) as string[]),
      ].sort((a, b) => a.localeCompare(b, "tr")),
    [books],
  );

  if (filtered.length === 0) {
    const isFiltered = books.length > 0;
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
            {isFiltered ? <SearchX size={24} /> : <BookOpen size={24} />}
          </div>
          <h3 className="font-semibold mb-1">
            {isFiltered ? "Sonuç bulunamadı" : "Henüz kitap yok"}
          </h3>
          <p className="text-sm text-mute max-w-xs">
            {isFiltered
              ? "Arama veya filtrelerle eşleşen kitap yok."
              : "Sağ üstten kitap ekleyebilir, Excel/CSV/JSON dosyasından içe aktarabilirsin."}
          </p>
          {isFiltered && (
            <button className="btn btn-outline mt-4" onClick={clearFilters}>
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
          onGenre={(g) => setGenre([...selectedIds], g)}
          onPublisher={(p) => setPublisher([...selectedIds], p)}
          onLoan={
            selectedIds.size === 1
              ? () =>
                  setLoanBook(
                    books.find((book) => selectedIds.has(book.id)) ?? null,
                  )
              : undefined
          }
          genres={allGenres}
          publishers={allPublishers}
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
                  {unit.items.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={() => onOpen(book)}
                      selected={selectedIds.has(book.id)}
                      onToggleSelect={() => toggleSelect(book.id)}
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
                      aria-label="Gösterilen kitapların tümünü seç"
                      checked={allSelected}
                      onChange={() =>
                        allSelected
                          ? clearSelection()
                          : selectAll(filtered.map((b) => b.id))
                      }
                    />
                  </th>
                  {visibleCols.map((col) => (
                    <ThSort
                      key={col.key}
                      label={BOOK_COLUMN_LABELS[col.key] ?? col.key}
                      k={col.key as SortKey}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onClick={setSort}
                      align={
                        ["pageCount", "publicationYear"].includes(col.key)
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
                  const b = unit.items[0];
                  return (
                    <tr
                      key={b.id}
                      ref={virtualizer.measureElement}
                      data-index={virtualRow.index}
                      tabIndex={0}
                      className={cn(
                        "group cursor-pointer border-b border-line transition-colors hover:bg-hover",
                        virtualRow.index % 2 === 0 ? "bg-row" : "bg-row-alt",
                        density === "compact" ? "text-[13px]" : "",
                      )}
                      onClick={() => onOpen(b)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpen(b);
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
                          aria-label={`${b.title} seç`}
                          checked={selectedIds.has(b.id)}
                          onChange={() => toggleSelect(b.id)}
                        />
                      </td>
                      {visibleCols.map((col) =>
                        renderCell(b, col.key, density),
                      )}
                      <td className="pr-3" onClick={(e) => e.stopPropagation()}>
                        {NEXT_STATUS[b.status] && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-lg bg-hover hover:bg-accent-soft hover:text-accent whitespace-nowrap"
                            onClick={() =>
                              setStatus([b.id], NEXT_STATUS[b.status]!)
                            }
                          >
                            {NEXT_LABEL[b.status]}
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
            {filtered.length} kitap gösteriliyor
          </div>
        </div>
      )}
      <LoanDialog
        book={loanBook}
        open={Boolean(loanBook)}
        onClose={() => setLoanBook(null)}
      />
    </div>
  );
}

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

function renderCell(b: Book, key: string, density: string) {
  const py = density === "compact" ? "py-2" : "py-3.5";
  switch (key) {
    case "title":
      return (
        <td key={key} className={cn("px-4", py, "font-medium")}>
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-[3px] h-4 rounded-full shrink-0",
                STATUS_TONE[b.status].dot,
              )}
            />
            <span className="truncate" title={b.title}>
              {b.title}
            </span>
          </div>
        </td>
      );
    case "author":
      return (
        <td key={key} className={cn("px-4", py)}>
          <span className="block truncate" title={b.author || undefined}>
            {b.author || EMPTY}
          </span>
        </td>
      );
    // Yayınevi iki satıra sarıp satırı şişiriyordu; tek satırda kesilir,
    // tam adı ipucunda kalır.
    case "publisher":
      return (
        <td key={key} className={cn("px-4", py, "text-mute")}>
          <span className="block truncate" title={b.publisher || undefined}>
            {b.publisher || EMPTY}
          </span>
        </td>
      );
    case "genre":
      return (
        <td key={key} className={cn("px-4", py)}>
          {b.genre ? <GenreChip genre={b.genre} /> : EMPTY}
        </td>
      );
    case "pageCount":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {b.pageCount ?? EMPTY}
        </td>
      );
    case "publicationYear":
      return (
        <td key={key} className={cn("px-4", py, "text-right tabular-nums")}>
          {b.publicationYear ?? EMPTY}
        </td>
      );
    case "rating":
      return (
        <td key={key} className={cn("px-4", py)}>
          {b.rating ? (
            <span className="inline-flex items-center gap-1">
              <Star size={12} className="fill-accent text-accent" />
              {b.rating}
            </span>
          ) : (
            EMPTY
          )}
        </td>
      );
    case "status":
      return (
        <td key={key} className={cn("px-4", py)}>
          <StatusBadge status={b.status} />
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
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onClick: (k: SortKey) => void;
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
  onGenre,
  onPublisher,
  onLoan,
  genres,
  publishers,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onStatus: (s: BookStatus) => void;
  onGenre: (g: string | undefined) => void;
  onPublisher: (p: string | undefined) => void;
  onLoan?: () => void;
  genres: string[];
  publishers: string[];
}) {
  return (
    <div className="sticky top-0 z-10 bg-accent-soft border-b border-line-strong px-5 py-2 flex items-center gap-3 text-sm flex-wrap">
      <span className="font-medium text-accent shrink-0">{count} seçili</span>

      <div className="w-px h-4 bg-accent/20 shrink-0" />

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-mute text-xs shrink-0">Durum:</span>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className="chip hover:bg-accent/20 text-xs"
            onClick={() => onStatus(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-accent/20 shrink-0" />

      <BulkPicker label="Tür" options={genres} onPick={onGenre} />
      <BulkPicker label="Yayınevi" options={publishers} onPick={onPublisher} />

      <div className="ml-auto flex items-center gap-2">
        {onLoan && (
          <button className="btn btn-outline" onClick={onLoan}>
            <UserRound size={14} /> Ödünç Ver
          </button>
        )}
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

function BulkPicker({
  label,
  options,
  onPick,
}: {
  label: string;
  options: string[];
  onPick: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pick = (v: string | undefined) => {
    onPick(v);
    setOpen(false);
    setCustom("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="chip hover:bg-accent/20 text-xs flex items-center gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {label} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-panel border border-line rounded-xl shadow-lg min-w-[180px] py-1 text-sm">
          <div className="px-3 py-1.5 border-b border-line">
            <div className="flex items-center gap-1">
              <input
                autoFocus
                className="input text-xs py-1 flex-1"
                placeholder={`Yeni ${label.toLowerCase()}…`}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && custom.trim()) pick(custom.trim());
                }}
              />
              {custom.trim() && (
                <button
                  className="btn btn-primary text-xs py-1 px-2 shrink-0"
                  onClick={() => pick(custom.trim())}
                >
                  Uygula
                </button>
              )}
            </div>
          </div>
          {options.length > 0 && (
            <div className="max-h-48 overflow-y-auto">
              {options.map((o) => (
                <button
                  key={o}
                  className="w-full text-left px-3 py-2 hover:bg-hover transition-colors text-xs"
                  onClick={() => pick(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-line">
            <button
              className="w-full text-left px-3 py-2 hover:bg-hover transition-colors text-xs text-mute flex items-center gap-1"
              onClick={() => pick(undefined)}
            >
              <X size={11} /> Temizle (boş bırak)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
