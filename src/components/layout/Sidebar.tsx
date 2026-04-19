import { useMemo } from 'react';
import { BookMarked, Filter, X } from 'lucide-react';
import { useBooks } from '../../store/booksStore';
import { STATUSES } from '../../constants/statuses';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { books, statusFilter, genreFilter, toggleStatusFilter, toggleGenreFilter, clearFilters } = useBooks();

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

  const hasActive = statusFilter.length > 0 || genreFilter.length > 0;

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

      <div className="px-5 py-4 flex-1 overflow-auto space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Durum</div>
            {hasActive && (
              <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={clearFilters}>
                <X size={12} /> temizle
              </button>
            )}
          </div>
          <div className="space-y-1">
            {STATUSES.map((s) => {
              const active = statusFilter.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => toggleStatusFilter(s.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    active ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-surface2 text-text',
                  )}
                >
                  <span>{s.label}</span>
                  <span className="text-xs text-muted">{counts[s.value] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeGenres.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <Filter size={12} /> Tür
            </div>
            <div className="space-y-1">
              {activeGenres.map(([g, count]) => {
                const active = genreFilter.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenreFilter(g)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors',
                      active ? 'bg-secondary/15 text-secondary font-medium' : 'hover:bg-surface2 text-text',
                    )}
                  >
                    <span>{g}</span>
                    <span className="text-xs text-muted">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
