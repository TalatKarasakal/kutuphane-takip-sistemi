import Dexie, { type Table } from "dexie";
import type { Book } from "../types/book";
import type { Media } from "../types/media";
import type { ActiveLoan, ArtworkCache, Tag } from "../types/library";
import { TAG_COLORS } from "../types/library";
import { runInChunks } from "../lib/dbBatch";

interface LegacyBook extends Book {
  tags?: string[];
}

const normalizeTagName = (value: string) =>
  value.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ");
const legacyTagId = (name: string) =>
  `legacy:${encodeURIComponent(normalizeTagName(name))}`;

export class LibraryDB extends Dexie {
  books!: Table<Book, string>;
  media!: Table<Media, string>;
  tags!: Table<Tag, string>;
  activeLoans!: Table<ActiveLoan, string>;
  artworkCache!: Table<ArtworkCache, string>;

  constructor() {
    super("kutuphanem");
    this.version(1).stores({
      books: "id, title, author, status, genre, addedAt, updatedAt",
    });
    this.version(2).stores({
      books: "id, title, author, status, genre, addedAt, updatedAt",
      media: "id, title, type, status, addedAt, updatedAt",
    });
    this.version(3)
      .stores({
        books:
          "id, title, author, status, genre, [status+genre], rating, *tagIds, addedAt, updatedAt",
        media:
          "id, title, type, status, genre, [type+status], [type+genre], *tagIds, addedAt, updatedAt",
        tags: "id, &name, color, createdAt, updatedAt",
        activeLoans: "bookId, loanedAt, dueAt",
        artworkCache:
          "key, [ownerType+ownerId], ownerType, ownerId, lastAccessedAt, updatedAt",
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString();
        const tags = new Map<string, Tag>();
        await tx
          .table<LegacyBook, string>("books")
          .toCollection()
          .modify((book) => {
            const names = Array.isArray(book.tags)
              ? book.tags.filter(
                  (name): name is string => typeof name === "string",
                )
              : [];
            if (names.length) {
              book.tagIds = [
                ...new Set(
                  names.map((name) => {
                    const clean = name.trim();
                    const id = legacyTagId(clean);
                    if (!tags.has(id)) {
                      tags.set(id, {
                        id,
                        name: clean,
                        color: TAG_COLORS[tags.size % TAG_COLORS.length],
                        createdAt: now,
                        updatedAt: now,
                      });
                    }
                    return id;
                  }),
                ),
              ];
            }
            delete book.tags;
          });
        if (tags.size)
          await runInChunks([...tags.values()], (chunk) =>
            tx.table<Tag, string>("tags").bulkPut(chunk),
          );
      });
  }
}

export const db = new LibraryDB();
