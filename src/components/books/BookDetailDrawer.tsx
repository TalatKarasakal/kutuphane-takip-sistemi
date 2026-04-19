import { Drawer } from '../ui/Drawer';
import { StatusBadge } from '../ui/Badge';
import { Pencil, Trash2, Star } from 'lucide-react';
import type { Book } from '../../types/book';

interface Props {
  book: Book | null;
  onClose: () => void;
  onEdit: (b: Book) => void;
  onDelete: (id: string) => void;
}

export function BookDetailDrawer({ book, onClose, onEdit, onDelete }: Props) {
  return (
    <Drawer
      open={!!book}
      onClose={onClose}
      title={book?.title ?? ''}
      footer={book && (
        <>
          <button className="btn btn-ghost text-secondary" onClick={() => { onDelete(book.id); onClose(); }}>
            <Trash2 size={16} /> Sil
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(book)}>
            <Pencil size={16} /> Düzenle
          </button>
        </>
      )}
    >
      {book && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">{book.title}</div>
              <div className="text-muted">{book.author}</div>
            </div>
            <StatusBadge status={book.status} />
          </div>

          {book.rating != null && (
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < book.rating! ? 'currentColor' : 'none'} />
              ))}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Yayınevi" value={book.publisher} />
            <Info label="Tür" value={book.genre} />
            <Info label="Sayfa" value={book.pageCount} />
            <Info label="Yayın Yılı" value={book.publicationYear} />
            <Info label="ISBN" value={book.isbn} />
            <Info label="Dil" value={book.language} />
            <Info label="Çevirmen" value={book.translator} />
            <Info label="Okuma" value={[book.readStartDate, book.readEndDate].filter(Boolean).join(' → ')} />
          </dl>

          {book.tags && book.tags.length > 0 && (
            <div>
              <div className="label">Etiketler</div>
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          )}

          {book.notes && (
            <div>
              <div className="label">Notlar</div>
              <div className="whitespace-pre-wrap rounded-lg bg-surface2 p-3 text-sm">{book.notes}</div>
            </div>
          )}

          <div className="text-xs text-muted pt-2 border-t border-border">
            Eklendi: {new Date(book.addedAt).toLocaleString('tr-TR')}
            {book.updatedAt !== book.addedAt && ` · Güncellendi: ${new Date(book.updatedAt).toLocaleString('tr-TR')}`}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <div className="label">{label}</div>
      <div>{value}</div>
    </div>
  );
}
