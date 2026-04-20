import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db } from '../db/database';
import { useToast } from './toastStore';
import type { Book, BookStatus } from '../types/book';

export type SortKey = 'addedAt' | 'title' | 'author' | 'publisher' | 'genre' | 'pageCount' | 'status' | 'publicationYear';
export type SortDir = 'asc' | 'desc';

interface BooksState {
  loaded: boolean;
  books: Book[];
  search: string;
  statusFilter: BookStatus[];
  genreFilter: string[];
  duplicatesOnly: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  selectedIds: Set<string>;

  load: () => Promise<void>;
  add: (b: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>) => Promise<Book>;
  addMany: (rows: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[]) => Promise<void>;
  update: (id: string, patch: Partial<Book>) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStatus: (ids: string[], status: BookStatus) => Promise<void>;

  setSearch: (v: string) => void;
  toggleStatusFilter: (s: BookStatus) => void;
  toggleGenreFilter: (g: string) => void;
  toggleDuplicatesOnly: () => void;
  clearFilters: () => void;
  setSort: (key: SortKey, dir?: SortDir) => void;

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export const useBooks = create<BooksState>((set, get) => ({
  loaded: false,
  books: [],
  search: '',
  statusFilter: [],
  genreFilter: [],
  duplicatesOnly: false,
  sortKey: 'addedAt',
  sortDir: 'desc',
  selectedIds: new Set(),

  load: async () => {
    const books = await db.books.toArray();
    set({ books, loaded: true });
  },

  add: async (b) => {
    const now = new Date().toISOString();
    const book: Book = { ...b, id: nanoid(), addedAt: now, updatedAt: now };
    await db.books.add(book);
    set({ books: [...get().books, book] });
    useToast.getState().show(`"${book.title}" eklendi`);
    return book;
  },

  addMany: async (rows) => {
    const now = new Date().toISOString();
    const books: Book[] = rows.map((r) => ({ ...r, id: nanoid(), addedAt: now, updatedAt: now }));
    await db.books.bulkAdd(books);
    set({ books: [...get().books, ...books] });
    useToast.getState().show(`${books.length} kitap içe aktarıldı`);
  },

  update: async (id, patch) => {
    const title = get().books.find((b) => b.id === id)?.title ?? '';
    const updated: Partial<Book> = { ...patch, updatedAt: new Date().toISOString() };
    await db.books.update(id, updated);
    set({
      books: get().books.map((b) => (b.id === id ? { ...b, ...updated } as Book : b)),
    });
    useToast.getState().show(`"${title}" güncellendi`);
  },

  remove: async (ids) => {
    const deleted = get().books.filter((b) => ids.includes(b.id));
    await db.books.bulkDelete(ids);
    const set0 = new Set(ids);
    set({
      books: get().books.filter((b) => !set0.has(b.id)),
      selectedIds: new Set([...get().selectedIds].filter((x) => !set0.has(x))),
    });
    useToast.getState().show(
      `${ids.length} kitap silindi`,
      'success',
      async () => {
        await db.books.bulkAdd(deleted);
        set({ books: [...get().books, ...deleted] });
      },
    );
  },

  setStatus: async (ids, status) => {
    const now = new Date().toISOString();
    await db.transaction('rw', db.books, async () => {
      await Promise.all(ids.map((id) => db.books.update(id, { status, updatedAt: now })));
    });
    const set0 = new Set(ids);
    set({
      books: get().books.map((b) => (set0.has(b.id) ? { ...b, status, updatedAt: now } : b)),
    });
  },

  setSearch: (v) => set({ search: v }),
  toggleStatusFilter: (s) => {
    const cur = get().statusFilter;
    set({ statusFilter: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] });
  },
  toggleGenreFilter: (g) => {
    const cur = get().genreFilter;
    set({ genreFilter: cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g] });
  },
  toggleDuplicatesOnly: () => set({ duplicatesOnly: !get().duplicatesOnly }),
  clearFilters: () => set({ statusFilter: [], genreFilter: [], search: '', duplicatesOnly: false }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir ?? (get().sortKey === key && get().sortDir === 'asc' ? 'desc' : 'asc') }),

  toggleSelect: (id) => {
    const s = new Set(get().selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    set({ selectedIds: s });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
}));
