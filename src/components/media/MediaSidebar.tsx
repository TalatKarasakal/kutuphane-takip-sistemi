import { useMemo } from 'react';
import { Film, Tv2, X } from 'lucide-react';
import { useMedia } from '../../store/mediaStore';
import { MEDIA_STATUSES } from '../../constants/mediaStatuses';
import type { MediaType } from '../../types/media';
import { cn } from '../../lib/utils';

interface Props {
  type: MediaType;
}

export function MediaSidebar({ type }: Props) {
  const { media, statusFilter, toggleStatusFilter, clearFilters } = useMedia();

  const items = useMemo(() => media.filter((m) => m.type === type), [media, type]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((m) => { c[m.status] = (c[m.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const hasActive = statusFilter.length > 0;
  const typeLabel = type === 'film' ? 'film' : 'dizi';
  const TypeIcon = type === 'film' ? Film : Tv2;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <TypeIcon size={18} />
        </div>
        <div>
          <div className="font-semibold leading-tight capitalize">{typeLabel === 'film' ? 'Filmlerim' : 'Dizilerim'}</div>
          <div className="text-xs text-muted">{items.length} {typeLabel}</div>
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
          {MEDIA_STATUSES.map((s, i) => {
            const active = statusFilter.includes(s.value);
            return (
              <FilterRow
                key={s.value}
                first={i === 0}
                active={active}
                onClick={() => toggleStatusFilter(s.value)}
                label={s.label}
                count={counts[s.value] ?? 0}
              />
            );
          })}
        </FilterCard>
      </div>
    </aside>
  );
}

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface2/40 overflow-hidden">
      <div className="px-3 pt-2.5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </div>
      <div className="border-t border-border/70" />
      <div className="p-1">{children}</div>
    </section>
  );
}

function FilterRow({ first, active, onClick, label, count }: {
  first?: boolean;
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
        !first && 'border-t border-border/60',
        active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-surface2 text-text',
      )}
    >
      <span>{label}</span>
      <span className="text-xs text-muted">{count}</span>
    </button>
  );
}
