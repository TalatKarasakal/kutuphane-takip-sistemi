import type { Book, BookStatus } from '../types/book';
import type { SortKey, SortDir } from '../store/booksStore';

export interface FilterArgs {
  search: string;
  statusFilter: BookStatus[];
  genreFilter: string[];
  sortKey: SortKey;
  sortDir: SortDir;
}

export function applyFilters(books: Book[], args: FilterArgs): Book[] {
  const q = args.search.trim().toLocaleLowerCase('tr');
  let out = books.filter((b) => {
    if (args.statusFilter.length && !args.statusFilter.includes(b.status)) return false;
    if (args.genreFilter.length && (!b.genre || !args.genreFilter.includes(b.genre))) return false;
    if (q) {
      const hay = [b.title, b.author, b.publisher, b.isbn, b.notes, ...(b.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr');
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const dir = args.sortDir === 'asc' ? 1 : -1;
  out = [...out].sort((a, b) => {
    const av = a[args.sortKey];
    const bv = b[args.sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv), 'tr') * dir;
  });

  return out;
}
