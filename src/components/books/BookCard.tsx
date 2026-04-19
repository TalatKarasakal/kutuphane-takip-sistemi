import { Star } from 'lucide-react';
import type { Book } from '../../types/book';
import { StatusBadge } from '../ui/Badge';

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-semibold leading-snug line-clamp-2">{book.title}</div>
        <StatusBadge status={book.status} />
      </div>
      <div className="text-sm text-muted mb-3 line-clamp-1">{book.author}</div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        {book.genre && <span className="chip">{book.genre}</span>}
        {book.publisher && <span className="chip">{book.publisher}</span>}
        {book.pageCount && <span className="chip">{book.pageCount} sy</span>}
      </div>
      {book.rating != null && (
        <div className="mt-3 flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} fill={i < book.rating! ? 'currentColor' : 'none'} />
          ))}
        </div>
      )}
    </button>
  );
}
