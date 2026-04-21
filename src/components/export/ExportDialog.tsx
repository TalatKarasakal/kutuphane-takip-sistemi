import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { EXPORT_FIELDS, exportCsv, exportJson, exportXlsx } from '../../lib/exporters';
import { MEDIA_EXPORT_FIELDS, exportMediaCsv, exportMediaJson, exportMediaXlsx } from '../../lib/exporters';
import { useBooks } from '../../store/booksStore';
import { useMedia } from '../../store/mediaStore';
import { applyFilters } from '../../lib/filters';
import { applyMediaFilters } from '../../store/mediaStore';
import type { Book } from '../../types/book';
import type { Media } from '../../types/media';
import type { Section } from '../layout/AppShell';

type Format = 'xlsx' | 'csv' | 'json';
type Scope = 'all' | 'filtered' | 'selected';

interface Props {
  open: boolean;
  onClose: () => void;
  section: Section;
}

export function ExportDialog({ open, onClose, section }: Props) {
  const books = useBooks();
  const media = useMedia();
  const isMedia = section !== 'books';
  const mediaType = section === 'movies' ? 'film' as const : 'dizi' as const;

  const [format, setFormat] = useState<Format>('xlsx');
  const [scope, setScope] = useState<Scope>('all');
  const [bookFields, setBookFields] = useState<(keyof Book)[]>(EXPORT_FIELDS.map((f) => f.key));
  const [mediaFields, setMediaFields] = useState<(keyof Media)[]>(MEDIA_EXPORT_FIELDS.map((f) => f.key));

  const filteredBooks = useMemo(
    () => applyFilters(books.books, { search: books.search, statusFilter: books.statusFilter, genreFilter: books.genreFilter, duplicatesOnly: books.duplicatesOnly, sortKey: books.sortKey, sortDir: books.sortDir }),
    [books.books, books.search, books.statusFilter, books.genreFilter, books.duplicatesOnly, books.sortKey, books.sortDir],
  );

  const filteredMedia = useMemo(
    () => applyMediaFilters(media.media, mediaType, { search: media.search, statusFilter: media.statusFilter, sortKey: media.sortKey, sortDir: media.sortDir }),
    [media.media, mediaType, media.search, media.statusFilter, media.sortKey, media.sortDir],
  );

  const allMedia = useMemo(() => media.media.filter((m) => m.type === mediaType), [media.media, mediaType]);

  const doExport = () => {
    const ts = new Date().toISOString().slice(0, 10);
    if (isMedia) {
      const target: Media[] = scope === 'all'
        ? allMedia
        : scope === 'filtered'
          ? filteredMedia
          : allMedia.filter((m) => media.selectedIds.has(m.id));
      const fn = `kutuphanem-${mediaType}-${ts}.${format}`;
      if (format === 'xlsx') exportMediaXlsx(target, mediaFields, fn);
      else if (format === 'csv') exportMediaCsv(target, mediaFields, fn);
      else exportMediaJson(target, mediaFields, fn);
    } else {
      const target: Book[] = scope === 'all'
        ? books.books
        : scope === 'filtered'
          ? filteredBooks
          : books.books.filter((b) => books.selectedIds.has(b.id));
      const fn = `kutuphanem-${ts}.${format}`;
      if (format === 'xlsx') exportXlsx(target, bookFields, fn);
      else if (format === 'csv') exportCsv(target, bookFields, fn);
      else exportJson(target, bookFields, fn);
    }
    onClose();
  };

  const totalCount = isMedia ? allMedia.length : books.books.length;
  const filteredCount = isMedia ? filteredMedia.length : filteredBooks.length;
  const selectedCount = isMedia ? media.selectedIds.size : books.selectedIds.size;

  const targetCount = scope === 'all' ? totalCount : scope === 'filtered' ? filteredCount : selectedCount;
  const currentFields = isMedia ? mediaFields : bookFields;
  const exportFields = isMedia ? MEDIA_EXPORT_FIELDS : EXPORT_FIELDS;

  const toggleField = (k: string) => {
    if (isMedia) {
      const key = k as keyof Media;
      setMediaFields((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]));
    } else {
      const key = k as keyof Book;
      setBookFields((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]));
    }
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
          <button className="btn btn-primary" onClick={doExport} disabled={targetCount === 0 || currentFields.length === 0}>
            Dışa Aktar ({targetCount})
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
            <ScopeBtn active={scope === 'all'} onClick={() => setScope('all')}>Tümü ({totalCount})</ScopeBtn>
            <ScopeBtn active={scope === 'filtered'} onClick={() => setScope('filtered')}>Filtreli ({filteredCount})</ScopeBtn>
            <ScopeBtn active={scope === 'selected'} onClick={() => setScope('selected')} disabled={selectedCount === 0}>Seçili ({selectedCount})</ScopeBtn>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="label m-0">Alanlar</div>
            <div className="flex gap-2 text-xs">
              <button className="text-primary hover:underline" onClick={() => {
                if (isMedia) setMediaFields(MEDIA_EXPORT_FIELDS.map((f) => f.key));
                else setBookFields(EXPORT_FIELDS.map((f) => f.key));
              }}>Tümü</button>
              <button className="text-primary hover:underline" onClick={() => {
                if (isMedia) setMediaFields([]);
                else setBookFields([]);
              }}>Hiçbiri</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {exportFields.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1.5 rounded-md hover:bg-surface2">
                <input
                  type="checkbox"
                  checked={currentFields.includes(f.key as never)}
                  onChange={() => toggleField(f.key)}
                />
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
