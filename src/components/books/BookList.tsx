import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, ChevronDown, Trash2, X } from 'lucide-react';
import { useBooks, type SortKey } from '../../store/booksStore';
import { useSettings } from '../../store/settingsStore';
import { applyFilters } from '../../lib/filters';
import { STATUSES } from '../../constants/statuses';
import { StatusBadge, GenreChip } from '../ui/Badge';
import { BookCard } from './BookCard';
import type { Book, BookStatus } from '../../types/book';
import { cn } from '../../lib/utils';

interface Props {
  onOpen: (b: Book) => void;
}

const STATUS_DOT: Record<BookStatus, string> = {
  okundu: 'bg-emerald-500',
  okunacak: 'bg-sky-500',
  mevcut: 'bg-amber-500',
  'satin-alinacak': 'bg-rose-500',
};

const NEXT_STATUS: Partial<Record<BookStatus, BookStatus>> = {
  'satin-alinacak': 'mevcut',
  mevcut: 'okunacak',
  okunacak: 'okundu',
};

const NEXT_LABEL: Partial<Record<BookStatus, string>> = {
  'satin-alinacak': '→ Mevcut',
  mevcut: '→ Okunacak',
  okunacak: '→ Okundu ✓',
};

export function BookList({ onOpen }: Props) {
  const { books, search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir, setSort, selectedIds, toggleSelect, selectAll, clearSelection, remove, setStatus, setGenre, setPublisher } = useBooks();
  const { view, density, bookColumns } = useSettings();

  const filtered = useMemo(
    () => applyFilters(books, { search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir }),
    [books, search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir],
  );

  const allSelected = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));
  const hasSel = selectedIds.size > 0;
  const visibleCols = useMemo(() => bookColumns.filter((c) => c.visible), [bookColumns]);

  const allGenres = useMemo(() => [...new Set(books.map((b) => b.genre).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'tr')), [books]);
  const allPublishers = useMemo(() => [...new Set(books.map((b) => b.publisher).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'tr')), [books]);

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
      {hasSel && (
        <BulkBar
          count={selectedIds.size}
          onClear={clearSelection}
          onDelete={() => remove([...selectedIds])}
          onStatus={(s) => setStatus([...selectedIds], s)}
          onGenre={(g) => setGenre([...selectedIds], g)}
          onPublisher={(p) => setPublisher([...selectedIds], p)}
          genres={allGenres}
          publishers={allPublishers}
        />
      )}

      {view === 'card' ? (
        <div className="p-5 grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} onClick={() => onOpen(b)} />
          ))}
        </div>
      ) : (
        <div className="p-5">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface2 text-muted text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="w-10 px-3 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => (allSelected ? clearSelection() : selectAll(filtered.map((b) => b.id)))}
                    />
                  </th>
                  {visibleCols.map((col) => (
                    <ThSort
                      key={col.key}
                      label={BOOK_COL_LABEL[col.key] ?? col.key}
                      k={col.key as SortKey}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onClick={setSort}
                      align={['pageCount', 'publicationYear'].includes(col.key) ? 'right' : undefined}
                    />
                  ))}
                  <th className="w-0" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className={cn(
                      'group border-t border-border/50 hover:bg-primary/5 cursor-pointer transition-colors',
                      density === 'compact' ? 'text-[13px]' : '',
                    )}
                    onClick={() => onOpen(b)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} />
                    </td>
                    {visibleCols.map((col) => renderCell(b, col.key, density))}
                    <td className="pr-3" onClick={(e) => e.stopPropagation()}>
                      {NEXT_STATUS[b.status] && (
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-surface2 hover:bg-primary/15 hover:text-primary whitespace-nowrap"
                          onClick={() => setStatus([b.id], NEXT_STATUS[b.status]!)}
                        >
                          {NEXT_LABEL[b.status]}
                        </button>
                      )}
                    </td>
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

const BOOK_COL_LABEL: Record<string, string> = {
  title: 'Başlık',
  author: 'Yazar',
  publisher: 'Yayınevi',
  genre: 'Tür',
  pageCount: 'Sayfa',
  publicationYear: 'Yayın Yılı',
  status: 'Durum',
};

const EMPTY = <span className="text-muted/30 select-none">—</span>;

function renderCell(b: Book, key: string, density: string) {
  const py = density === 'compact' ? 'py-2' : 'py-3.5';
  switch (key) {
    case 'title': return (
      <td key={key} className={cn('px-4', py, 'font-medium')}>
        <div className="flex items-center gap-2.5">
          <div className={cn('w-[3px] h-4 rounded-full shrink-0', STATUS_DOT[b.status])} />
          {b.title}
        </div>
      </td>
    );
    case 'author': return <td key={key} className={cn('px-4', py)}>{b.author || EMPTY}</td>;
    case 'publisher': return <td key={key} className={cn('px-4', py, 'text-muted')}>{b.publisher ?? EMPTY}</td>;
    case 'genre': return (
      <td key={key} className={cn('px-4', py)}>
        {b.genre ? <GenreChip genre={b.genre} /> : EMPTY}
      </td>
    );
    case 'pageCount': return <td key={key} className={cn('px-4', py, 'text-right tabular-nums')}>{b.pageCount ?? EMPTY}</td>;
    case 'publicationYear': return <td key={key} className={cn('px-4', py, 'text-right tabular-nums')}>{b.publicationYear ?? EMPTY}</td>;
    case 'status': return <td key={key} className={cn('px-4', py)}><StatusBadge status={b.status} /></td>;
    default: return null;
  }
}

function ThSort({
  label, k, sortKey, sortDir, onClick, align,
}: { label: string; k: SortKey; sortKey: SortKey; sortDir: 'asc' | 'desc'; onClick: (k: SortKey) => void; align?: 'right' }) {
  const active = sortKey === k;
  return (
    <th className={cn('px-4 py-3.5 font-semibold', align === 'right' ? 'text-right' : 'text-left')}>
      <button onClick={() => onClick(k)} className="inline-flex items-center gap-1 hover:text-text">
        {label}
        {active ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
      </button>
    </th>
  );
}

function BulkBar({
  count, onClear, onDelete, onStatus, onGenre, onPublisher, genres, publishers,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onStatus: (s: BookStatus) => void;
  onGenre: (g: string | undefined) => void;
  onPublisher: (p: string | undefined) => void;
  genres: string[];
  publishers: string[];
}) {
  return (
    <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 px-5 py-2 flex items-center gap-3 text-sm flex-wrap">
      <span className="font-medium text-primary shrink-0">{count} seçili</span>

      <div className="w-px h-4 bg-primary/20 shrink-0" />

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-muted text-xs shrink-0">Durum:</span>
        {STATUSES.map((s) => (
          <button key={s.value} className="chip hover:bg-primary/20 text-xs" onClick={() => onStatus(s.value)}>{s.label}</button>
        ))}
      </div>

      <div className="w-px h-4 bg-primary/20 shrink-0" />

      <BulkPicker label="Tür" options={genres} onPick={onGenre} />
      <BulkPicker label="Yayınevi" options={publishers} onPick={onPublisher} />

      <div className="ml-auto flex items-center gap-2">
        <button className="btn btn-ghost text-secondary" onClick={onDelete}><Trash2 size={14} /> Sil</button>
        <button className="btn btn-ghost" onClick={onClear}>Seçimi Kaldır</button>
      </div>
    </div>
  );
}

function BulkPicker({ label, options, onPick }: { label: string; options: string[]; onPick: (v: string | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (v: string | undefined) => { onPick(v); setOpen(false); setCustom(''); };

  return (
    <div ref={ref} className="relative">
      <button
        className="chip hover:bg-primary/20 text-xs flex items-center gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {label} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-surface border border-border rounded-xl shadow-lg min-w-[180px] py-1 text-sm">
          <div className="px-3 py-1.5 border-b border-border">
            <div className="flex items-center gap-1">
              <input
                autoFocus
                className="input text-xs py-1 flex-1"
                placeholder={`Yeni ${label.toLowerCase()}…`}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) pick(custom.trim()); }}
              />
              {custom.trim() && (
                <button className="btn btn-primary text-xs py-1 px-2 shrink-0" onClick={() => pick(custom.trim())}>
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
                  className="w-full text-left px-3 py-2 hover:bg-surface2 transition-colors text-xs"
                  onClick={() => pick(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-border">
            <button
              className="w-full text-left px-3 py-2 hover:bg-surface2 transition-colors text-xs text-muted flex items-center gap-1"
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
