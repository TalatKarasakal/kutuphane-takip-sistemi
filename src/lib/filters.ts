import type { Book, BookStatus } from "../types/book";
import type { SortKey, SortDir } from "../store/booksStore";
import type { TagFilterMode } from "../types/library";

export interface FilterArgs {
  search: string;
  statusFilter: BookStatus[];
  genreFilter: string[];
  tagFilter?: string[];
  tagFilterMode?: TagFilterMode;
  duplicatesOnly?: boolean;
  loansOnly?: boolean;
  loanIds?: Set<string>;
  sortKey: SortKey;
  sortDir: SortDir;
}

const normStr = (s?: string) =>
  (s ?? "").trim().toLocaleLowerCase("tr").replace(/\s+/g, " ");

export function duplicateKey(b: Book): string | null {
  const isbn = normStr(b.isbn).replace(/[-\s]/g, "");
  if (isbn) return `isbn:${isbn}`;
  const title = normStr(b.title);
  const author = normStr(b.author);
  if (title && author) return `ta:${title}|${author}`;
  return null;
}

export function findDuplicateIds(books: Book[]): Set<string> {
  const groups = new Map<string, string[]>();
  for (const b of books) {
    const k = duplicateKey(b);
    if (!k) continue;
    const arr = groups.get(k) ?? [];
    arr.push(b.id);
    groups.set(k, arr);
  }
  const dup = new Set<string>();
  for (const ids of groups.values()) {
    if (ids.length > 1) ids.forEach((id) => dup.add(id));
  }
  return dup;
}

export function applyFilters(books: Book[], args: FilterArgs): Book[] {
  const q = args.search.trim().toLocaleLowerCase("tr");
  const dupIds = args.duplicatesOnly ? findDuplicateIds(books) : null;
  let out = books.filter((b) => {
    if (dupIds && !dupIds.has(b.id)) return false;
    if (args.loansOnly && !args.loanIds?.has(b.id)) return false;
    if (args.statusFilter.length && !args.statusFilter.includes(b.status))
      return false;
    if (
      args.genreFilter.length &&
      (!b.genre || !args.genreFilter.includes(b.genre))
    )
      return false;
    if (args.tagFilter?.length) {
      const ids = b.tagIds ?? [];
      const matches =
        args.tagFilterMode === "and"
          ? args.tagFilter.every((id) => ids.includes(id))
          : args.tagFilter.some((id) => ids.includes(id));
      if (!matches) return false;
    }
    if (q) {
      const hay = [b.title, b.author, b.publisher, b.isbn, b.notes]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const dir = args.sortDir === "asc" ? 1 : -1;
  out = [...out].sort((a, b) => {
    const av = a[args.sortKey];
    const bv = b[args.sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number")
      return (av - bv) * dir;
    return String(av).localeCompare(String(bv), "tr") * dir;
  });

  return out;
}
