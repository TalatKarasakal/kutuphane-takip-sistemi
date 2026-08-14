import { useEffect, useMemo, useState } from "react";
import { Filter, X, Copy, Tags, UserRound, Layers3 } from "lucide-react";
import { useBooks } from "../../store/booksStore";
import { useLoans } from "../../store/loansStore";
import { useTags } from "../../store/tagsStore";
import { STATUSES } from "../../constants/statuses";
import { findDuplicateIds } from "../../lib/filters";
import { cn } from "../../lib/utils";
import { DuplicateMergeDialog } from "../books/DuplicateMergeDialog";
import { FilterCard, FilterRow, SidebarSearch } from "./FilterPanel";

export function Sidebar({
  searchRef,
}: {
  searchRef?: React.RefObject<HTMLInputElement>;
}) {
  const {
    books,
    statusFilter,
    genreFilter,
    tagFilter,
    tagFilterMode,
    groupByTags,
    duplicatesOnly,
    loansOnly,
    search,
    setSearch,
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
    <aside className="w-64 shrink-0 border-r border-edge bg-panel flex flex-col">
      <SidebarSearch
        value={search}
        onChange={setSearch}
        placeholder="Arama"
        inputRef={searchRef}
      />

      <div className="px-4 py-4 flex-1 overflow-auto space-y-3">
        {hasActive && (
          <div className="flex justify-end">
            <button
              className="text-xs text-secondary hover:underline flex items-center gap-1"
              onClick={clearFilters}
            >
              <X size={12} /> filtreleri temizle
            </button>
          </div>
        )}

        <FilterCard title="Durum">
          {STATUSES.map((s, i) => (
            <FilterRow
              key={s.value}
              first={i === 0}
              active={statusFilter.includes(s.value)}
              // Durum satırları kendi renkleriyle işaretlenir; listedeki ve
              // karttaki renk şeridiyle aynı dili konuşurlar.
              tone={s.tone}
              onClick={() => toggleStatusFilter(s.value)}
              label={s.label}
              count={counts[s.value] ?? 0}
              share={books.length ? (counts[s.value] ?? 0) / books.length : 0}
            />
          ))}
        </FilterCard>

        {tags.length > 0 && (
          <FilterCard title="Etiketler" icon={<Tags size={12} />} tone="accent">
            <div className="flex justify-end gap-1 px-2 pb-1">
              {(["or", "and"] as const).map((mode) => (
                <button
                  key={mode}
                  className={cn(
                    "rounded-lg px-1.5 py-0.5 text-[10px] font-semibold",
                    tagFilterMode === mode
                      ? "bg-primary text-primary-foreground"
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
                  ? "bg-primary/10 text-primary-ink"
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
          <FilterCard
            title="Ödünç Verilenler"
            icon={<UserRound size={12} />}
            tone="warm"
          >
            <FilterRow
              first
              active={loansOnly}
              accent="secondary"
              onClick={toggleLoansOnly}
              label="Aktif ödünçler"
              count={loans.length}
            />
          </FilterCard>
        )}

        {activeGenres.length > 0 && (
          <FilterCard title="Tür" icon={<Filter size={12} />} tone="secondary">
            {activeGenres.map(([g, count], i) => (
              <FilterRow
                key={g}
                first={i === 0}
                active={genreFilter.includes(g)}
                accent="secondary"
                onClick={() => toggleGenreFilter(g)}
                label={g}
                count={count}
              />
            ))}
          </FilterCard>
        )}

        {duplicateCount > 0 && (
          <FilterCard
            title="Tekrar Edenler"
            icon={<Copy size={12} />}
            tone="secondary"
          >
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
