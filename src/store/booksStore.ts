import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import { findDuplicateIds } from "../lib/filters";
import {
  normalizeBookDraft,
  validationMessage,
  type BookDraft,
} from "../lib/validation";
import { useToast } from "./toastStore";
import { useLoans } from "./loansStore";
import type { Book, BookStatus } from "../types/book";
import type { TagFilterMode } from "../types/library";

export type SortKey =
  | "addedAt"
  | "title"
  | "author"
  | "publisher"
  | "genre"
  | "pageCount"
  | "status"
  | "publicationYear"
  | "rating";
export type SortDir = "asc" | "desc";

interface BooksState {
  loaded: boolean;
  loading: boolean;
  error?: string;
  books: Book[];
  search: string;
  statusFilter: BookStatus[];
  genreFilter: string[];
  tagFilter: string[];
  tagFilterMode: TagFilterMode;
  duplicatesOnly: boolean;
  loansOnly: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  selectedIds: Set<string>;

  load: () => Promise<void>;
  add: (book: BookDraft) => Promise<Book>;
  addMany: (rows: BookDraft[]) => Promise<Book[]>;
  update: (id: string, patch: Partial<BookDraft>) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStatus: (ids: string[], status: BookStatus) => Promise<void>;
  setGenre: (ids: string[], genre: string | undefined) => Promise<void>;
  setPublisher: (ids: string[], publisher: string | undefined) => Promise<void>;
  setTags: (ids: string[], tagIds: string[]) => Promise<void>;
  mergeDuplicates: (
    targetId: string,
    sourceIds: string[],
    draft: BookDraft,
  ) => Promise<void>;

  setSearch: (value: string) => void;
  toggleStatusFilter: (status: BookStatus) => void;
  toggleGenreFilter: (genre: string) => void;
  toggleTagFilter: (tagId: string) => void;
  setTagFilterMode: (mode: TagFilterMode) => void;
  toggleDuplicatesOnly: () => void;
  toggleLoansOnly: () => void;
  clearFilters: () => void;
  setSort: (key: SortKey, direction?: SortDir) => void;

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

const BATCH_SIZE = 500;

function draftFromBook(book: Book): BookDraft {
  const { id: _id, addedAt: _addedAt, updatedAt: _updatedAt, ...draft } = book;
  return draft;
}

function showFailure(prefix: string, error: unknown): never {
  useToast.getState().show(`${prefix}: ${validationMessage(error)}`, "error");
  throw error;
}

export const useBooks = create<BooksState>((set, get) => ({
  loaded: false,
  loading: false,
  error: undefined,
  books: [],
  search: "",
  statusFilter: [],
  genreFilter: [],
  tagFilter: [],
  tagFilterMode: "or",
  duplicatesOnly: false,
  loansOnly: false,
  sortKey: "addedAt",
  sortDir: "desc",
  selectedIds: new Set(),

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      const books = await db.books.toArray();
      set({ books, loaded: true, loading: false });
    } catch (error) {
      const message = validationMessage(error);
      set({ loading: false, error: message });
      showFailure("Kitaplar yüklenemedi", error);
    }
  },

  add: async (input) => {
    try {
      const draft = normalizeBookDraft(input);
      const now = new Date().toISOString();
      const book: Book = {
        ...draft,
        id: nanoid(),
        addedAt: now,
        updatedAt: now,
      };
      await db.books.add(book);
      set({ books: [...get().books, book] });
      useToast.getState().show(`"${book.title}" eklendi`);
      return book;
    } catch (error) {
      return showFailure("Kitap eklenemedi", error);
    }
  },

  addMany: async (rows) => {
    try {
      const normalized = rows.map((row) => normalizeBookDraft(row));
      const now = new Date().toISOString();
      const books: Book[] = normalized.map((row) => ({
        ...row,
        id: nanoid(),
        addedAt: now,
        updatedAt: now,
      }));
      await db.transaction("rw", db.books, async () => {
        for (let index = 0; index < books.length; index += BATCH_SIZE) {
          await db.books.bulkAdd(books.slice(index, index + BATCH_SIZE));
        }
      });
      const all = [...get().books, ...books];
      set({ books: all });
      const duplicateCount = findDuplicateIds(all).size;
      const suffix = duplicateCount
        ? ` · ${duplicateCount} mükerrer kayıt uyarısı`
        : "";
      useToast
        .getState()
        .show(
          `${books.length} kitap içe aktarıldı${suffix}`,
          duplicateCount ? "info" : "success",
        );
      return books;
    } catch (error) {
      return showFailure("Kitaplar içe aktarılamadı", error);
    }
  },

  update: async (id, patch) => {
    const current = get().books.find((book) => book.id === id);
    if (!current) return;
    try {
      const draft = normalizeBookDraft({ ...draftFromBook(current), ...patch });
      const next: Book = {
        ...current,
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      await db.books.put(next);
      set({ books: get().books.map((book) => (book.id === id ? next : book)) });
      useToast.getState().show(`"${next.title}" güncellendi`);
    } catch (error) {
      showFailure("Kitap güncellenemedi", error);
    }
  },

  remove: async (ids) => {
    const idSet = new Set(ids);
    const deletedBooks = get().books.filter((book) => idSet.has(book.id));
    const deletedLoans = await db.activeLoans
      .where("bookId")
      .anyOf(ids)
      .toArray();
    const deletedArtwork = (
      await Promise.all(
        ids.map((id) =>
          db.artworkCache
            .where("[ownerType+ownerId]")
            .equals(["book", id])
            .toArray(),
        ),
      )
    ).flat();
    try {
      await db.transaction(
        "rw",
        db.books,
        db.activeLoans,
        db.artworkCache,
        async () => {
          await db.books.bulkDelete(ids);
          await db.activeLoans.bulkDelete(ids);
          if (deletedArtwork.length)
            await db.artworkCache.bulkDelete(
              deletedArtwork.map((item) => item.key),
            );
        },
      );
      set({
        books: get().books.filter((book) => !idSet.has(book.id)),
        selectedIds: new Set(
          [...get().selectedIds].filter((id) => !idSet.has(id)),
        ),
      });
      await useLoans.getState().load();
      useToast
        .getState()
        .show(`${ids.length} kitap silindi`, "success", async () => {
          await db.transaction(
            "rw",
            db.books,
            db.activeLoans,
            db.artworkCache,
            async () => {
              if (deletedBooks.length) await db.books.bulkPut(deletedBooks);
              if (deletedLoans.length)
                await db.activeLoans.bulkPut(deletedLoans);
              if (deletedArtwork.length)
                await db.artworkCache.bulkPut(deletedArtwork);
            },
          );
          set({ books: [...get().books, ...deletedBooks] });
          await useLoans.getState().load();
        });
    } catch (error) {
      showFailure("Kitaplar silinemedi", error);
    }
  },

  setStatus: async (ids, status) => {
    try {
      const now = new Date().toISOString();
      await db.transaction("rw", db.books, async () => {
        await Promise.all(
          ids.map((id) => db.books.update(id, { status, updatedAt: now })),
        );
      });
      const idSet = new Set(ids);
      set({
        books: get().books.map((book) =>
          idSet.has(book.id) ? { ...book, status, updatedAt: now } : book,
        ),
      });
      useToast.getState().show(`${ids.length} kitabın durumu güncellendi`);
    } catch (error) {
      showFailure("Durum güncellenemedi", error);
    }
  },

  setGenre: async (ids, genre) => {
    try {
      const now = new Date().toISOString();
      await db.transaction("rw", db.books, async () => {
        await Promise.all(
          ids.map((id) => db.books.update(id, { genre, updatedAt: now })),
        );
      });
      const idSet = new Set(ids);
      set({
        books: get().books.map((book) =>
          idSet.has(book.id) ? { ...book, genre, updatedAt: now } : book,
        ),
      });
      useToast.getState().show(`${ids.length} kitabın türü güncellendi`);
    } catch (error) {
      showFailure("Tür güncellenemedi", error);
    }
  },

  setPublisher: async (ids, publisher) => {
    try {
      const now = new Date().toISOString();
      await db.transaction("rw", db.books, async () => {
        await Promise.all(
          ids.map((id) => db.books.update(id, { publisher, updatedAt: now })),
        );
      });
      const idSet = new Set(ids);
      set({
        books: get().books.map((book) =>
          idSet.has(book.id) ? { ...book, publisher, updatedAt: now } : book,
        ),
      });
      useToast.getState().show(`${ids.length} kitabın yayınevi güncellendi`);
    } catch (error) {
      showFailure("Yayınevi güncellenemedi", error);
    }
  },

  setTags: async (ids, tagIds) => {
    try {
      const now = new Date().toISOString();
      const unique = [...new Set(tagIds)];
      await db.transaction("rw", db.books, async () => {
        await Promise.all(
          ids.map((id) =>
            db.books.update(id, { tagIds: unique, updatedAt: now }),
          ),
        );
      });
      const idSet = new Set(ids);
      set({
        books: get().books.map((book) =>
          idSet.has(book.id)
            ? { ...book, tagIds: unique, updatedAt: now }
            : book,
        ),
      });
      useToast.getState().show(`${ids.length} kitabın etiketleri güncellendi`);
    } catch (error) {
      showFailure("Etiketler güncellenemedi", error);
    }
  },

  mergeDuplicates: async (targetId, sourceIds, input) => {
    const allIds = [...new Set(sourceIds.filter((id) => id !== targetId))];
    const target = get().books.find((book) => book.id === targetId);
    if (!target || !allIds.length) return;
    try {
      const draft = normalizeBookDraft(input);
      const now = new Date().toISOString();
      const next: Book = { ...target, ...draft, updatedAt: now };
      const loans = await db.activeLoans
        .where("bookId")
        .anyOf([targetId, ...allIds])
        .toArray();
      const loan = loans.find((item) => item.bookId === targetId) ?? loans[0];
      await db.transaction(
        "rw",
        db.books,
        db.activeLoans,
        db.artworkCache,
        async () => {
          await db.books.put(next);
          await db.books.bulkDelete(allIds);
          await db.activeLoans.bulkDelete([targetId, ...allIds]);
          if (loan) await db.activeLoans.put({ ...loan, bookId: targetId });
          for (const sourceId of allIds) {
            await db.artworkCache
              .where("[ownerType+ownerId]")
              .equals(["book", sourceId])
              .delete();
          }
        },
      );
      const removed = new Set(allIds);
      set({
        books: get()
          .books.map((book) => (book.id === targetId ? next : book))
          .filter((book) => !removed.has(book.id)),
      });
      await useLoans.getState().load();
      useToast
        .getState()
        .show(`${allIds.length + 1} mükerrer kayıt birleştirildi`);
    } catch (error) {
      showFailure("Mükerrer kayıtlar birleştirilemedi", error);
    }
  },

  setSearch: (search) => set({ search }),
  toggleStatusFilter: (status) => {
    const current = get().statusFilter;
    set({
      statusFilter: current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    });
  },
  toggleGenreFilter: (genre) => {
    const current = get().genreFilter;
    set({
      genreFilter: current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre],
    });
  },
  toggleTagFilter: (tagId) => {
    const current = get().tagFilter;
    set({
      tagFilter: current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId],
    });
  },
  setTagFilterMode: (tagFilterMode) => set({ tagFilterMode }),
  toggleDuplicatesOnly: () =>
    set({ duplicatesOnly: !get().duplicatesOnly, loansOnly: false }),
  toggleLoansOnly: () =>
    set({ loansOnly: !get().loansOnly, duplicatesOnly: false }),
  clearFilters: () =>
    set({
      statusFilter: [],
      genreFilter: [],
      tagFilter: [],
      search: "",
      duplicatesOnly: false,
      loansOnly: false,
    }),
  setSort: (sortKey, sortDir) =>
    set({
      sortKey,
      sortDir:
        sortDir ??
        (get().sortKey === sortKey && get().sortDir === "asc" ? "desc" : "asc"),
    }),

  toggleSelect: (id) => {
    const selectedIds = new Set(get().selectedIds);
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    set({ selectedIds });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
}));
