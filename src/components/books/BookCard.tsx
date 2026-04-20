import { useMemo } from 'react';
import type { Book } from '../../types/book';
import { StatusBadge, GenreChip } from '../ui/Badge';
import { useCover } from '../../lib/useCover';

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const cover = useCover(book.coverUrl, book.isbn);
  const hue = useMemo(
    () => book.title.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360,
    [book.title],
  );

  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-40 w-full overflow-hidden shrink-0">
        {cover ? (
          <img src={cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue},50%,55%), hsl(${(hue + 45) % 360},50%,40%))` }}
          >
            <span className="text-5xl font-bold text-white/60 select-none">{book.title[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={book.status} />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="font-semibold leading-snug line-clamp-2 text-sm">{book.title}</div>
        {book.author && <div className="text-xs text-muted line-clamp-1">{book.author}</div>}
        <div className="flex flex-wrap items-center gap-1 mt-auto pt-2">
          {book.genre && <GenreChip genre={book.genre} />}
          {book.pageCount && <span className="chip text-[11px]">{book.pageCount} sy</span>}
        </div>
      </div>
    </button>
  );
}
