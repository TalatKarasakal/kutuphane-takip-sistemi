import { useMemo } from 'react';
import { BookMarked, Filter, X, Copy } from 'lucide-react';
import { useBooks } from '../../store/booksStore';
import { STATUSES } from '../../constants/statuses';
import { findDuplicateIds } from '../../lib/filters';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { books, statusFilter, genreFilter, duplicatesOnly, toggleStatusFilter, toggleGenreFilter, toggleDuplicatesOnly, clearFilters } = useBooks();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: books.length };
    books.forEach((b) => { c[b.status] = (c[b.status] ?? 0) + 1; });
    return c;
  }, [books]);

  const activeGenres = useMemo(() => {
    const c: Record<string, number> = {};
    books.forEach((b) => { if (b.genre) c[b.genre] = (c[b.genre] ?? 0) + 1; });
    return Object.entries(c).sort((a, b) => a[0].localeCompare(b[0], 'tr'));
  }, [books]);

  const duplicateCount = useMemo(() => findDuplicateIds(books).size, [books]);

  const hasActive = statusFilter.length > 0 || genreFilter.length > 0 || duplicatesOnly;

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
            <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={clearFilters}>
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

        <FilterCard title="Tür" icon={<Filter size={12} />}>
          {activeGenres.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted italic">Henüz tür eklenmemiş</div>
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
          </FilterCard>
        )}
      </div>
    </aside>
  );
}

function FilterCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
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
  first, active, accent, onClick, label, count, title,
}: {
  first?: boolean;
  active: boolean;
  accent: 'primary' | 'secondary';
  onClick: () => void;
  label: string;
  count: number;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
        !first && 'border-t border-border/60',
        active
          ? accent === 'primary'
            ? 'bg-primary/10 text-primary font-medium'
            : 'bg-secondary/10 text-secondary font-medium'
          : 'hover:bg-surface2 text-text',
      )}
    >
      <span>{label}</span>
      <span className="text-xs text-muted">{count}</span>
    </button>
  );
}
