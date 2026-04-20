import { useMemo } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Film, Tv2, Trash2 } from 'lucide-react';
import { useMedia, applyMediaFilters, type MediaSortKey } from '../../store/mediaStore';
import { useSettings } from '../../store/settingsStore';
import { MEDIA_STATUSES } from '../../constants/mediaStatuses';
import { MediaStatusBadge } from '../ui/Badge';
import { MediaCard } from './MediaCard';
import type { Media, MediaStatus, MediaType } from '../../types/media';
import { cn } from '../../lib/utils';

interface Props {
  type: MediaType;
  onOpen: (m: Media) => void;
}

const MEDIA_STATUS_DOT: Record<MediaStatus, string> = {
  izlendi: 'bg-emerald-500',
  izlenecek: 'bg-sky-500',
};

const NEXT_STATUS: Partial<Record<MediaStatus, MediaStatus>> = {
  izlenecek: 'izlendi',
};

const NEXT_LABEL: Partial<Record<MediaStatus, string>> = {
  izlenecek: '→ İzlendi ✓',
};

export function MediaList({ type, onOpen }: Props) {
  const { media, search, statusFilter, sortKey, sortDir, setSort, selectedIds, toggleSelect, selectAll, clearSelection, remove, setStatus } = useMedia();
  const { view, density, filmColumns, tvColumns } = useSettings();

  const columns = type === 'film' ? filmColumns : tvColumns;
  const visibleCols = useMemo(() => columns.filter((c) => c.visible), [columns]);

  const filtered = useMemo(
    () => applyMediaFilters(media, type, { search, statusFilter, sortKey, sortDir }),
    [media, type, search, statusFilter, sortKey, sortDir],
  );

  const allSelected = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const hasSel = selectedIds.size > 0;
  const typeLabel = type === 'film' ? 'film' : 'dizi';
  const TypeIcon = type === 'film' ? Film : Tv2;

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
            <TypeIcon size={24} />
          </div>
          <h3 className="font-semibold mb-1">Henüz {typeLabel} yok</h3>
          <p className="text-sm text-muted max-w-xs">Sağ üstten {typeLabel} ekleyebilirsin.</p>
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
        />
      )}

      {view === 'card' ? (
        <div className="p-5 grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {filtered.map((m) => (
            <MediaCard key={m.id} item={m} onClick={() => onOpen(m)} />
          ))}
        </div>
      ) : (
        <div className="p-5">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface2 text-muted text-xs tracking-wide">
                <tr>
                  <th className="w-10 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => (allSelected ? clearSelection() : selectAll(filtered.map((m) => m.id)))}
                    />
                  </th>
                  {visibleCols.map((col) => (
                    <ThSort
                      key={col.key}
                      label={MEDIA_COL_LABEL[col.key] ?? col.key}
                      k={col.key as MediaSortKey}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onClick={setSort}
                      align={['releaseYear', 'watchYear', 'duration', 'seasons', 'episodeDuration'].includes(col.key) ? 'right' : undefined}
                    />
                  ))}
                  <th className="w-0" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className={cn(
                      'group border-t border-border hover:bg-surface2/60 cursor-pointer transition-colors',
                      density === 'compact' ? 'text-[13px]' : '',
                    )}
                    onClick={() => onOpen(m)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(m.id)} onChange={() => toggleSelect(m.id)} />
                    </td>
                    {visibleCols.map((col) => renderCell(m, col.key, density))}
                    <td className="pr-3" onClick={(e) => e.stopPropagation()}>
                      {NEXT_STATUS[m.status] && (
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-surface2 hover:bg-primary/15 hover:text-primary whitespace-nowrap"
                          onClick={() => setStatus([m.id], NEXT_STATUS[m.status]!)}
                        >
                          {NEXT_LABEL[m.status]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-muted">{filtered.length} {typeLabel} gösteriliyor</div>
        </div>
      )}
    </div>
  );
}

const MEDIA_COL_LABEL: Record<string, string> = {
  title: 'Başlık',
  director: 'Yönetmen',
  releaseYear: 'Çıkış Yılı',
  duration: 'Süre (dk)',
  seasons: 'Sezon',
  episodeDuration: 'Bölüm Süresi (dk)',
  watchYear: 'İzlenme Yılı',
  status: 'Durum',
};

function renderCell(m: Media, key: string, density: string) {
  const py = density === 'compact' ? 'py-1.5' : 'py-3';
  switch (key) {
    case 'title': return (
      <td key={key} className={cn('px-3', py, 'font-medium')}>
        <div className="flex items-center gap-2">
          <div className={cn('w-1 h-4 rounded-full shrink-0', MEDIA_STATUS_DOT[m.status])} />
          {m.title}
        </div>
      </td>
    );
    case 'director': return <td key={key} className="px-3 text-muted">{m.director ?? '—'}</td>;
    case 'releaseYear': return <td key={key} className="px-3 text-right tabular-nums">{m.releaseYear ?? '—'}</td>;
    case 'duration': return <td key={key} className="px-3 text-right tabular-nums">{m.duration ? `${m.duration} dk` : '—'}</td>;
    case 'seasons': return <td key={key} className="px-3 text-right tabular-nums">{m.seasons ?? '—'}</td>;
    case 'episodeDuration': return <td key={key} className="px-3 text-right tabular-nums">{m.episodeDuration ? `${m.episodeDuration} dk` : '—'}</td>;
    case 'watchYear': return <td key={key} className="px-3 text-right tabular-nums">{m.watchYear ?? '—'}</td>;
    case 'status': return <td key={key} className="px-3"><MediaStatusBadge status={m.status} /></td>;
    default: return null;
  }
}

function ThSort({
  label, k, sortKey, sortDir, onClick, align,
}: { label: string; k: MediaSortKey; sortKey: MediaSortKey; sortDir: 'asc' | 'desc'; onClick: (k: MediaSortKey) => void; align?: 'right' }) {
  const active = sortKey === k;
  return (
    <th className={cn('px-3 py-3 font-semibold', align === 'right' ? 'text-right' : 'text-left')}>
      <button onClick={() => onClick(k)} className="inline-flex items-center gap-1 hover:text-text">
        {label}
        {active ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
      </button>
    </th>
  );
}

function BulkBar({ count, onClear, onDelete, onStatus }: { count: number; onClear: () => void; onDelete: () => void; onStatus: (s: MediaStatus) => void }) {
  return (
    <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 px-5 py-2 flex items-center gap-2 text-sm">
      <span className="font-medium text-primary">{count} seçili</span>
      <div className="ml-4 flex items-center gap-1">
        <span className="text-muted mr-1">Durum değiştir:</span>
        {MEDIA_STATUSES.map((s) => (
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
