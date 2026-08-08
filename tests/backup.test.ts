import { describe, expect, it } from "vitest";
import { parseSnapshot } from "../src/lib/backup";
import { ValidationError } from "../src/lib/validation";

const timestamp = "2026-08-08T10:00:00.000Z";
const baseBook = {
  id: "b1",
  title: "Kitap",
  author: "",
  status: "mevcut",
  addedAt: timestamp,
  updatedAt: timestamp,
};

describe("backup schema", () => {
  it("migrates v1 text tags and normalizes blank authors", () => {
    const snapshot = parseSnapshot(
      JSON.stringify({
        version: 1,
        exportedAt: timestamp,
        books: [{ ...baseBook, tags: ["Favori"] }],
        media: [],
      }),
    );
    expect(snapshot.version).toBe(2);
    expect(snapshot.books[0].author).toBe("Bilinmiyor");
    expect(snapshot.tags[0].name).toBe("Favori");
    expect(snapshot.books[0].tagIds).toEqual([snapshot.tags[0].id]);
  });

  it("rejects future versions and malformed v2 tag identities", () => {
    expect(() =>
      parseSnapshot(JSON.stringify({ version: 99, books: [], media: [] })),
    ).toThrow(ValidationError);
    expect(() =>
      parseSnapshot(
        JSON.stringify({
          app: "kutuphanem",
          version: 2,
          exportedAt: timestamp,
          books: [baseBook],
          media: [],
          activeLoans: [],
          tags: [
            {
              name: "Eksik",
              color: "#123456",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
        }),
      ),
    ).toThrow(ValidationError);
  });

  it("rejects orphaned active loans", () => {
    expect(() =>
      parseSnapshot(
        JSON.stringify({
          app: "kutuphanem",
          version: 2,
          exportedAt: timestamp,
          books: [],
          media: [],
          tags: [],
          activeLoans: [
            { bookId: "missing", borrower: "Kişi", loanedAt: "2026-08-08" },
          ],
        }),
      ),
    ).toThrow(ValidationError);
  });
});
