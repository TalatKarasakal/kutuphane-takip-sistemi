import { describe, expect, it } from "vitest";
import { applyFilters, findDuplicateIds } from "../src/lib/filters";
import type { Book } from "../src/types/book";
import { createBooks } from "./fixtures/library";

const book = (
  id: string,
  title: string,
  author = "Bilinmiyor",
  isbn?: string,
): Book => ({
  id,
  title,
  author,
  isbn,
  status: "mevcut",
  addedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("collection filters", () => {
  it("finds duplicate ISBN values after normalization", () => {
    const duplicates = findDuplicateIds([
      book("a", "Bir", "Yazar", "978-1-23"),
      book("b", "İki", "Başka", "978123"),
      book("c", "Üç", "Yazar", "123"),
    ]);

    expect([...duplicates]).toEqual(["a", "b"]);
  });

  it("uses Turkish casing during search", () => {
    const result = applyFilters([book("a", "Işık", "İlker")], {
      search: "ışık",
      statusFilter: [],
      genreFilter: [],
      sortKey: "title",
      sortDir: "asc",
    });

    expect(result).toHaveLength(1);
  });

  it("supports OR by default and explicit AND tag filters", () => {
    const books = [
      { ...book("a", "Bir"), tagIds: ["red"] },
      { ...book("b", "İki"), tagIds: ["red", "blue"] },
      { ...book("c", "Üç"), tagIds: ["green"] },
    ];
    const base = {
      search: "",
      statusFilter: [],
      genreFilter: [],
      tagFilter: ["red", "blue"],
      sortKey: "title" as const,
      sortDir: "asc" as const,
    };
    expect(applyFilters(books, base).map((item) => item.id)).toEqual([
      "a",
      "b",
    ]);
    expect(
      applyFilters(books, { ...base, tagFilterMode: "and" }).map(
        (item) => item.id,
      ),
    ).toEqual(["b"]);
  });

  it("filters and sorts the 10,000-record regression fixture under the target budget", () => {
    const books = createBooks();
    const started = performance.now();
    const result = applyFilters(books, {
      search: "ışık",
      statusFilter: ["okundu"],
      genreFilter: [],
      tagFilter: ["tag-0"],
      sortKey: "title",
      sortDir: "asc",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(performance.now() - started).toBeLessThan(300);
  });
});
