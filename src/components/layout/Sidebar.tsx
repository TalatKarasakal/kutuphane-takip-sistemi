import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Filter,
  X,
  Copy,
  Tags,
  UserRound,
  Layers3,
} from "lucide-react";
import { useBooks } from "../../store/booksStore";
import { useLoans } from "../../store/loansStore";
import { useTags } from "../../store/tagsStore";
import { STATUSES } from "../../constants/statuses";
import { findDuplicateIds } from "../../lib/filters";
import { cn } from "../../lib/utils";
import { DuplicateMergeDialog } from "../books/DuplicateMergeDialog";

export function Sidebar() {
  const {
    books,
    statusFilter,
    genreFilter,
    tagFilter,
    tagFilterMode,
    groupByTags,
    duplicatesOnly,
    loansOnly,
    toggleStatusFilter,
    toggleGenreFilter,
    toggleTagFilter,
    setTagFilterMode,
    toggleGroupByTags,
    toggleDuplicatesOnly,
    toggleLoansOnly,
    clearFilters,
  } = useBooks();
  const loans = useLoans((state) => state.loans);
  const tags = useTags((state) => state.tags);
  const [mergeOpen, setMergeOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: books.length };
    books.forEach((b) => {
      c[b.status] = (c[b.status] ?? 0) + 1;
    });
    return c;
  }, [books]);

  const activeGenres = useMemo(() => {
    const c: Record<string, number> = {};
    books.forEach((b) => {
      if (b.genre) c[b.genre] = (c[b.genre] ?? 0) + 1;
    });
    return Object.entries(c).sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [books]);

  const duplicateCount = useMemo(() => findDuplicateIds(books).size, [books]);

  // Yinelenen kalmayınca filtre kartı (ve kapatma düğmesi) DOM'dan kalkar; bu durumda
  // duplicatesOnly açık kalırsa liste boş görünüp kullanıcıyı çıkmaza sokar. Otomatik kapat.
  useEffect(() => {
    if (duplicatesOnly && duplicateCount === 0) toggleDuplicatesOnly();
  }, [duplicatesOnly, duplicateCount, toggleDuplicatesOnly]);

  useEffect(() => {
    if (loansOnly && loans.length === 0) toggleLoansOnly();
  }, [loans.length, loansOnly, toggleLoansOnly]);

  const hasActive =
    statusFilter.length > 0 ||
    genreFilter.length > 0 ||
    tagFilter.length > 0 ||
    groupByTags ||
    duplicatesOnly ||
    loansOnly;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <BookMarked size={18} />
        </div>
        <div>
          <div className="font-semibold leading-tight">Kütüphanem</div>
          <div className="text-xs text-muted">{books.length} kitap</div>
        </div>
      </div>

      <div className="px-4 py-4 flex-1 overflow-auto space-y-3">
        {hasActive && (
          <div className="flex justify-end">
            <button
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={clearFilters}
            >
              <X size={12} /> filtreleri temizle
            </button>
          </div>
        )}

        <FilterCard title="Durum">
          {STATUSES.map((s, i) => {
            const active = statusFilter.includes(s.value);
            return (
              <FilterRow
                key={s.value}
                first={i === 0}
                active={active}
                accent="primary"
                onClick={() => toggleStatusFilter(s.value)}
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
                  onClick={() => setTagFilterMode(mode)}
                  aria-pressed={tagFilterMode === mode}
                  title={
                    mode === "or"
                      ? "Etiketlerden herhangi biri"
                      : "Etiketlerin tümü"
                  }
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
                onClick={() => toggleTagFilter(tag.id)}
                label={tag.name}
                count={
                  books.filter((book) => book.tagIds?.includes(tag.id)).length
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
              onClick={toggleGroupByTags}
              aria-pressed={groupByTags}
            >
              <Layers3 size={12} /> Etikete göre grupla
            </button>
          </FilterCard>
        )}

        {loans.length > 0 && (
          <FilterCard title="Ödünç Verilenler" icon={<UserRound size={12} />}>
            <FilterRow
              first
              active={loansOnly}
              accent="primary"
              onClick={toggleLoansOnly}
              label="Aktif ödünçler"
              count={loans.length}
            />
          </FilterCard>
        )}

        <FilterCard title="Tür" icon={<Filter size={12} />}>
          {activeGenres.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted italic">
              Henüz tür eklenmemiş
            </div>
          ) : (
            activeGenres.map(([g, count], i) => {
              const active = genreFilter.includes(g);
              return (
                <FilterRow
                  key={g}
                  first={i === 0}
                  active={active}
                  accent="secondary"
                  onClick={() => toggleGenreFilter(g)}
                  label={g}
                  count={count}
                />
              );
            })
          )}
        </FilterCard>

        {duplicateCount > 0 && (
          <FilterCard title="Tekrar Edenler" icon={<Copy size={12} />}>
            <FilterRow
              first
              active={duplicatesOnly}
              accent="secondary"
              onClick={toggleDuplicatesOnly}
              label="Yalnızca tekrarları göster"
              count={duplicateCount}
              title="ISBN eşleşmesi, yoksa başlık + yazar eşleşmesiyle belirlenir"
            />
            <button
              className="btn btn-outline m-2 w-[calc(100%-1rem)] text-xs"
              onClick={() => setMergeOpen(true)}
            >
              Alan Seçerek Birleştir
            </button>
          </FilterCard>
        )}
      </div>
      <DuplicateMergeDialog
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
      />
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
  title,
  color,
}: {
  first?: boolean;
  active: boolean;
  accent: "primary" | "secondary";
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
