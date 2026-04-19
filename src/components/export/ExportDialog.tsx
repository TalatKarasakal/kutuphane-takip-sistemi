import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { EXPORT_FIELDS, exportCsv, exportJson, exportXlsx } from '../../lib/exporters';
import { useBooks } from '../../store/booksStore';
import { applyFilters } from '../../lib/filters';
import type { Book } from '../../types/book';

type Format = 'xlsx' | 'csv' | 'json';
type Scope = 'all' | 'filtered' | 'selected';

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { books, search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir, selectedIds } = useBooks();
  const [format, setFormat] = useState<Format>('xlsx');
  const [scope, setScope] = useState<Scope>('all');
  const [fields, setFields] = useState<(keyof Book)[]>(EXPORT_FIELDS.map((f) => f.key));

  const filtered = useMemo(
    () => applyFilters(books, { search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir }),
    [books, search, statusFilter, genreFilter, duplicatesOnly, sortKey, sortDir],
  );

  const target: Book[] = scope === 'all'
    ? books
    : scope === 'filtered'
      ? filtered
      : books.filter((b) => selectedIds.has(b.id));

  const doExport = () => {
    const ts = new Date().toISOString().slice(0, 10);
    const fn = `kutuphanem-${ts}.${format}`;
    if (format === 'xlsx') exportXlsx(target, fields, fn);
    else if (format === 'csv') exportCsv(target, fields, fn);
    else exportJson(target, fields, fn);
    onClose();
  };

  const toggleField = (k: keyof Book) => {
    setFields((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dışa Aktar"
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" onClick={doExport} disabled={target.length === 0 || fields.length === 0}>
            Dışa Aktar ({target.length})
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="label">Biçim</div>
          <div className="flex gap-2">
            {(['xlsx', 'csv', 'json'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`btn ${format === f ? 'btn-primary' : 'btn-outline'}`}
              >
                .{f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Kapsam</div>
          <div className="flex gap-2 flex-wrap">
            <ScopeBtn active={scope === 'all'} onClick={() => setScope('all')}>Tümü ({books.length})</ScopeBtn>
            <ScopeBtn active={scope === 'filtered'} onClick={() => setScope('filtered')}>Filtreli ({filtered.length})</ScopeBtn>
            <ScopeBtn active={scope === 'selected'} onClick={() => setScope('selected')} disabled={selectedIds.size === 0}>Seçili ({selectedIds.size})</ScopeBtn>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="label m-0">Alanlar</div>
            <div className="flex gap-2 text-xs">
              <button className="text-primary hover:underline" onClick={() => setFields(EXPORT_FIELDS.map((f) => f.key))}>Tümü</button>
              <button className="text-primary hover:underline" onClick={() => setFields([])}>Hiçbiri</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EXPORT_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1.5 rounded-md hover:bg-surface2">
                <input type="checkbox" checked={fields.includes(f.key)} onChange={() => toggleField(f.key)} />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ScopeBtn({ active, children, ...rest }: { active: boolean; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} {...rest}>{children}</button>
  );
}
