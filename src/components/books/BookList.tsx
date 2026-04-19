import { useMemo } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, Trash2 } from 'lucide-react';
import { useBooks, type SortKey } from '../../store/booksStore';
import { useSettings } from '../../store/settingsStore';
import { applyFilters } from '../../lib/filters';
import { STATUSES } from '../../constants/statuses';
import { StatusBadge } from '../ui/Badge';
import { BookCard } from './BookCard';
import type { Book, BookStatus } from '../../types/book';
import { cn } from '../../lib/utils';

interface Props {
  onOpen: (b: Book) => void;
}

export function BookList({ onOpen }: Props) {
  const { books, search, statusFilter, genreFilter, sortKey, sortDir, setSort, selectedIds, toggleSelect, selectAll, clearSelection, remove, setStatus } = useBooks();
  const { view, density } = useSettings();

  const filtered = useMemo(
    () => applyFilters(books, { search, statusFilter, genreFilter, sortKey, sortDir }),
    [books, search, statusFilter, genreFilter, sortKey, sortDir],
  );

  const allSelected = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));
  const hasSel = selectedIds.size > 0;

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="font-semibold mb-1">Henüz kitap yok</h3>
          <p className="text-sm text-muted max-w-xs">Sağ üstten kitap ekleyebilir, Excel/CSV/JSON dosyasından içe aktarabilirsin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {hasSel && <BulkBar count={selectedIds.size} onClear={clearSelection} onDelete={() => remove([...selectedIds])} onStatus={(s) => setStatus([...selectedIds], s)} />}

      {view === 'card' ? (
        <div className="p-5 grid gap-3 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} onClick={() => onOpen(b)} />
          ))}
        </div>
      ) : (
        <div className="p-5">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface2 text-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="w-10 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => (allSelected ? clearSelection() : selectAll(filtered.map((b) => b.id)))}
                    />
                  </th>
                  <ThSort label="Başlık" k="title" sortKey={sortKey} sortDir={sortDir} onClick={setSort} />
                  <ThSort label="Yazar" k="author" sortKey={sortKey} sortDir={sortDir} onClick={setSort} />
                  <th className="px-3 py-3 text-left">Yayınevi</th>
                  <th className="px-3 py-3 text-left">Tür</th>
                  <ThSort label="Sayfa" k="pageCount" sortKey={sortKey} sortDir={sortDir} onClick={setSort} align="right" />
                  <th className="px-3 py-3 text-left">Durum</th>
                  <ThSort label="Puan" k="rating" sortKey={sortKey} sortDir={sortDir} onClick={setSort} align="right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className={cn(
                      'border-t border-border hover:bg-surface2/60 cursor-pointer transition-colors',
                      density === 'compact' ? 'text-[13px]' : '',
                    )}
                    onClick={() => onOpen(b)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} />
                    </td>
                    <td className={cn('px-3', density === 'compact' ? 'py-1.5' : 'py-3', 'font-medium')}>{b.title}</td>
                    <td className="px-3">{b.author}</td>
                    <td className="px-3 text-muted">{b.publisher ?? '—'}</td>
                    <td className="px-3">{b.genre ? <span className="chip">{b.genre}</span> : <span className="text-muted">—</span>}</td>
                    <td className="px-3 text-right tabular-nums">{b.pageCount ?? '—'}</td>
                    <td className="px-3"><StatusBadge status={b.status} /></td>
                    <td className="px-3 text-right tabular-nums">{b.rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-muted">{filtered.length} kitap gösteriliyor</div>
        </div>
      )}
    </div>
  );
}

function ThSort({
  label, k, sortKey, sortDir, onClick, align,
}: { label: string; k: SortKey; sortKey: SortKey; sortDir: 'asc' | 'desc'; onClick: (k: SortKey) => void; align?: 'right' }) {
  const active = sortKey === k;
  return (
    <th className={cn('px-3 py-3', align === 'right' ? 'text-right' : 'text-left')}>
      <button onClick={() => onClick(k)} className="inline-flex items-center gap-1 hover:text-text">
        {label}
        {active ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
      </button>
    </th>
  );
}

function BulkBar({ count, onClear, onDelete, onStatus }: { count: number; onClear: () => void; onDelete: () => void; onStatus: (s: BookStatus) => void }) {
  return (
    <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 px-5 py-2 flex items-center gap-2 text-sm">
      <span className="font-medium text-primary">{count} seçili</span>
      <div className="ml-4 flex items-center gap-1">
        <span className="text-muted mr-1">Durum değiştir:</span>
        {STATUSES.map((s) => (
          <button key={s.value} className="chip hover:bg-primary/20" onClick={() => onStatus(s.value)}>{s.label}</button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="btn btn-ghost text-secondary" onClick={onDelete}><Trash2 size={14} /> Sil</button>
        <button className="btn btn-ghost" onClick={onClear}>Temizle</button>
      </div>
    </div>
  );
}
