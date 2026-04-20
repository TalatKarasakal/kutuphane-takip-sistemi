import type { Book, BookStatus } from '../../types/book';
import { StatusBadge, GenreChip } from '../ui/Badge';
import { useCover } from '../../lib/useCover';

const STATUS_STRIPE: Record<BookStatus, string> = {
  okundu: 'bg-emerald-500',
  okunacak: 'bg-sky-500',
  mevcut: 'bg-amber-500',
  'satin-alinacak': 'bg-rose-500',
};

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const cover = useCover(book.coverUrl, book.isbn);

  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
    >
      {cover ? (
        <div className="relative h-44 w-full overflow-hidden shrink-0">
          <img src={cover} alt={book.title} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-2 right-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20">
              {book.status === 'okundu' ? '✓ Okundu'
                : book.status === 'okunacak' ? '⏱ Okunacak'
                : book.status === 'mevcut' ? '📖 Elimde'
                : '🛒 Satın Alınacak'}
            </span>
          </div>
        </div>
      ) : (
        <div className={`h-1 w-full shrink-0 ${STATUS_STRIPE[book.status]}`} />
      )}

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="font-semibold leading-snug line-clamp-2">{book.title}</div>
        {book.author && <div className="text-xs text-muted line-clamp-1">{book.author}</div>}
        <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
          {!cover && <StatusBadge status={book.status} />}
          {book.genre && <GenreChip genre={book.genre} />}
          {book.pageCount && <span className="chip text-[11px]">{book.pageCount} sy</span>}
        </div>
      </div>
    </button>
  );
}
