import { describe, expect, it } from "vitest";
import {
  isValidIsbn,
  normalizeBookDraft,
  normalizeMediaDraft,
  sanitizeSpreadsheetValue,
  ValidationError,
} from "../src/lib/validation";

describe("central validation", () => {
  it("validates ISBN-10 and ISBN-13 checksums", () => {
    expect(isValidIsbn("978-0-306-40615-7")).toBe(true);
    expect(isValidIsbn("0-306-40615-2")).toBe(true);
    expect(isValidIsbn("9780306406158")).toBe(false);
  });

  it("uses Bilinmiyor for a blank author", () => {
    expect(
      normalizeBookDraft({ title: "Kitap", author: " ", status: "mevcut" })
        .author,
    ).toBe("Bilinmiyor");
  });

  it("rejects inverted reading dates and unsafe poster URLs", () => {
    expect(() =>
      normalizeBookDraft({
        title: "Kitap",
        author: "Yazar",
        status: "okundu",
        readStartDate: "2026-05-02",
        readEndDate: "2026-05-01",
      }),
    ).toThrow(ValidationError);
    expect(() =>
      normalizeMediaDraft({
        title: "Film",
        type: "film",
        status: "izlenecek",
        posterUrl: "file:///tmp/a.png",
      }),
    ).toThrow(ValidationError);
  });

  it("escapes spreadsheet formulas", () => {
    expect(sanitizeSpreadsheetValue("=2+2")).toBe("'=2+2");
    expect(sanitizeSpreadsheetValue("normal")).toBe("normal");
  });
});
