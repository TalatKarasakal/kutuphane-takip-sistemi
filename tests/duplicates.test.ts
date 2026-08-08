import { describe, expect, it } from "vitest";
import { mergeBookDraft } from "../src/lib/duplicates";
import type { Book } from "../src/types/book";

const record = (id: string, title: string, tagIds: string[]): Book => ({
  id,
  title,
  tagIds,
  author: "Yazar",
  status: "mevcut",
  addedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("duplicate merge", () => {
  it("keeps field selections and unions tags", () => {
    const target = record("a", "Eski başlık", ["one"]);
    const source = {
      ...record("b", "Yeni başlık", ["two", "one"]),
      publisher: "Yayınevi",
    };
    const merged = mergeBookDraft(target, [source], {
      title: source.title,
      publisher: source.publisher,
    });
    expect(merged.title).toBe("Yeni başlık");
    expect(merged.publisher).toBe("Yayınevi");
    expect(merged.tagIds).toEqual(["one", "two"]);
  });
});
