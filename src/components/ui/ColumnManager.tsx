import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Columns3 } from 'lucide-react';
import type { ColumnConfig } from '../../types/book';
import { cn } from '../../lib/utils';

interface Props {
  columns: ColumnConfig[];
  labels: Record<string, string>;
  onChange: (cols: ColumnConfig[]) => void;
}

export function ColumnManager({ columns, labels, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const toggle = (key: string) => {
    if (key === 'title') return;
    onChange(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...columns];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className={cn('btn btn-ghost', open && 'bg-surface2')}
        onClick={() => setOpen((v) => !v)}
        title="Sütunları düzenle"
      >
        <Columns3 size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-lg p-1.5 w-56">
          <div className="px-2 py-1 text-xs font-semibold text-muted uppercase tracking-wide mb-1">Sütunlar</div>
          {columns.map((col, idx) => (
            <div
              key={col.key}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 group"
            >
              <input
                type="checkbox"
                checked={col.visible}
                disabled={col.key === 'title'}
                onChange={() => toggle(col.key)}
                className="cursor-pointer"
              />
              <span className="flex-1 text-sm truncate">{labels[col.key] ?? col.key}</span>
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-0.5 text-muted hover:text-text disabled:opacity-30 leading-none"
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === columns.length - 1}
                  className="p-0.5 text-muted hover:text-text disabled:opacity-30 leading-none"
                >
                  <ChevronDown size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
