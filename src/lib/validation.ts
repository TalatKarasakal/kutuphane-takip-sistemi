import type { Book, BookStatus, Rating } from "../types/book";
import type { Media, MediaStatus, MediaType } from "../types/media";
import type { ActiveLoan, Tag } from "../types/library";
import { TAG_COLORS } from "../types/library";

export const LIMITS = {
  importBytes: 25 * 1024 * 1024,
  backupBytes: 100 * 1024 * 1024,
  imageBytes: 10 * 1024 * 1024,
  maxRecords: 50_000,
  title: 300,
  person: 200,
  shortText: 160,
  notes: 10_000,
  tagName: 40,
  url: 2_048,
} as const;

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.field}: ${issue.message}`).join("; "));
    this.name = "ValidationError";
  }
}

export type BookDraft = Omit<Book, "id" | "addedAt" | "updatedAt">;
export type MediaDraft = Omit<Media, "id" | "addedAt" | "updatedAt">;

const BOOK_STATUSES = new Set<BookStatus>([
  "okundu",
  "okunacak",
  "mevcut",
  "satin-alinacak",
]);
const MEDIA_STATUSES = new Set<MediaStatus>(["izlendi", "izlenecek"]);
const MEDIA_TYPES = new Set<MediaType>(["film", "dizi"]);

function cleanText(
  value: unknown,
  field: string,
  max: number,
  issues: ValidationIssue[],
): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim().replace(/\s+/g, " ");
  if (!text) return undefined;
  if (text.length > max)
    issues.push({ field, message: `En fazla ${max} karakter olabilir.` });
  return text.slice(0, max);
}

function cleanMultiline(
  value: unknown,
  field: string,
  max: number,
  issues: ValidationIssue[],
): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  if (text.length > max)
    issues.push({ field, message: `En fazla ${max} karakter olabilir.` });
  return text.slice(0, max);
}

function integer(
  value: unknown,
  field: string,
  min: number,
  max: number,
  issues: ValidationIssue[],
): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    issues.push({ field, message: `${min}–${max} arasında tam sayı olmalı.` });
    return undefined;
  }
  return parsed;
}

function date(
  value: unknown,
  field: string,
  issues: ValidationIssue[],
): string | undefined {
  const text = cleanText(value, field, 10, issues);
  if (!text) return undefined;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
    Number.isNaN(Date.parse(`${text}T00:00:00Z`))
  ) {
    issues.push({ field, message: "Geçerli YYYY-AA-GG tarihi olmalı." });
    return undefined;
  }
  return text;
}

export function normalizeIsbn(value: unknown): string | undefined {
  if (value == null) return undefined;
  const isbn = String(value)
    .toUpperCase()
    .replace(/[^0-9X]/g, "");
  return isbn || undefined;
}

export function isValidIsbn(value: unknown): boolean {
  const isbn = normalizeIsbn(value);
  if (!isbn) return false;
  if (/^\d{13}$/.test(isbn)) {
    const sum = [...isbn].reduce(
      (total, char, index) => total + Number(char) * (index % 2 === 0 ? 1 : 3),
      0,
    );
    return sum % 10 === 0;
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce(
      (total, char, index) =>
        total + (char === "X" ? 10 : Number(char)) * (10 - index),
      0,
    );
    return sum % 11 === 0;
  }
  return false;
}

export function normalizeHttpsUrl(
  value: unknown,
  field = "url",
  issues: ValidationIssue[] = [],
): string | undefined {
  const text = cleanText(value, field, LIMITS.url, issues);
  if (!text) return undefined;
  try {
    const url = new URL(text.replace(/^http:\/\//i, "https://"));
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error("unsafe");
    return url.toString();
  } catch {
    issues.push({ field, message: "Geçerli bir HTTPS adresi olmalı." });
    return undefined;
  }
}

function cleanTagIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids = [
    ...new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  return ids.length ? ids.slice(0, 100) : undefined;
}

export function normalizeBookDraft(input: Partial<BookDraft>): BookDraft {
  const issues: ValidationIssue[] = [];
  const title = cleanText(input.title, "title", LIMITS.title, issues);
  if (!title) issues.push({ field: "title", message: "Başlık zorunludur." });
  const author =
    cleanText(input.author, "author", LIMITS.person, issues) ?? "Bilinmiyor";
  const isbn = normalizeIsbn(input.isbn);
  if (isbn && !isValidIsbn(isbn))
    issues.push({
      field: "isbn",
      message: "ISBN-10/13 kontrol basamağı geçersiz.",
    });
  const readStartDate = date(input.readStartDate, "readStartDate", issues);
  const readEndDate = date(input.readEndDate, "readEndDate", issues);
  if (readStartDate && readEndDate && readEndDate < readStartDate) {
    issues.push({
      field: "readEndDate",
      message: "Bitiş tarihi başlangıçtan önce olamaz.",
    });
  }
  const status = BOOK_STATUSES.has(input.status as BookStatus)
    ? (input.status as BookStatus)
    : "mevcut";
  const ratingNumber = integer(input.rating, "rating", 1, 5, issues);
  const coverUrl = normalizeHttpsUrl(input.coverUrl, "coverUrl", issues);
  const publisher = cleanText(
    input.publisher,
    "publisher",
    LIMITS.shortText,
    issues,
  );
  const pageCount = integer(input.pageCount, "pageCount", 1, 100_000, issues);
  const genre = cleanText(input.genre, "genre", LIMITS.shortText, issues);
  const publicationYear = integer(
    input.publicationYear,
    "publicationYear",
    1000,
    new Date().getFullYear() + 2,
    issues,
  );
  const language = cleanText(
    input.language,
    "language",
    LIMITS.shortText,
    issues,
  );
  const translator = cleanText(
    input.translator,
    "translator",
    LIMITS.person,
    issues,
  );
  const notes = cleanMultiline(input.notes, "notes", LIMITS.notes, issues);
  if (issues.length) throw new ValidationError(issues);
  return {
    title: title!,
    author,
    publisher,
    pageCount,
    genre,
    isbn,
    publicationYear,
    language,
    translator,
    status,
    rating: ratingNumber as Rating | undefined,
    notes,
    tagIds: cleanTagIds(input.tagIds),
    coverUrl,
    readStartDate,
    readEndDate,
  };
}

export function normalizeMediaDraft(input: Partial<MediaDraft>): MediaDraft {
  const issues: ValidationIssue[] = [];
  const title = cleanText(input.title, "title", LIMITS.title, issues);
  if (!title) issues.push({ field: "title", message: "Başlık zorunludur." });
  const type = MEDIA_TYPES.has(input.type as MediaType)
    ? (input.type as MediaType)
    : "film";
  const status = MEDIA_STATUSES.has(input.status as MediaStatus)
    ? (input.status as MediaStatus)
    : "izlenecek";
  const posterUrl = normalizeHttpsUrl(input.posterUrl, "posterUrl", issues);
  const currentYear = new Date().getFullYear();
  const releaseYear = integer(
    input.releaseYear,
    "releaseYear",
    1888,
    currentYear + 2,
    issues,
  );
  const watchYear = integer(
    input.watchYear,
    "watchYear",
    1888,
    currentYear + 1,
    issues,
  );
  const duration = integer(input.duration, "duration", 1, 2_000, issues);
  const seasons = integer(input.seasons, "seasons", 1, 10_000, issues);
  const episodeDuration = integer(
    input.episodeDuration,
    "episodeDuration",
    1,
    1_000,
    issues,
  );
  const director = cleanText(input.director, "director", LIMITS.person, issues);
  const genre = cleanText(input.genre, "genre", LIMITS.shortText, issues);
  const notes = cleanMultiline(input.notes, "notes", LIMITS.notes, issues);
  if (issues.length) throw new ValidationError(issues);
  return {
    title: title!,
    type,
    director,
    genre,
    releaseYear,
    watchYear,
    duration: type === "film" ? duration : undefined,
    seasons: type === "dizi" ? seasons : undefined,
    episodeDuration: type === "dizi" ? episodeDuration : undefined,
    status,
    notes,
    tagIds: cleanTagIds(input.tagIds),
    posterUrl,
  };
}

export function normalizeActiveLoan(input: ActiveLoan): ActiveLoan {
  const issues: ValidationIssue[] = [];
  const borrower = cleanText(input.borrower, "borrower", LIMITS.person, issues);
  if (!borrower)
    issues.push({ field: "borrower", message: "Ödünç alan kişi zorunludur." });
  const loanedAt = date(input.loanedAt, "loanedAt", issues);
  if (!loanedAt)
    issues.push({ field: "loanedAt", message: "Veriliş tarihi zorunludur." });
  const dueAt = date(input.dueAt, "dueAt", issues);
  if (loanedAt && dueAt && dueAt < loanedAt)
    issues.push({
      field: "dueAt",
      message: "İade tarihi verilişten önce olamaz.",
    });
  if (!input.bookId?.trim())
    issues.push({ field: "bookId", message: "Kitap kimliği zorunludur." });
  if (issues.length) throw new ValidationError(issues);
  return {
    bookId: input.bookId.trim(),
    borrower: borrower!,
    loanedAt: loanedAt!,
    dueAt,
  };
}

export function normalizeTag(input: Tag): Tag {
  const issues: ValidationIssue[] = [];
  const name = cleanText(input.name, "name", LIMITS.tagName, issues);
  if (!name) issues.push({ field: "name", message: "Etiket adı zorunludur." });
  if (
    !/^#[0-9a-f]{6}$/i.test(input.color) &&
    !TAG_COLORS.includes(input.color as (typeof TAG_COLORS)[number])
  ) {
    issues.push({ field: "color", message: "Geçerli #RRGGBB rengi olmalı." });
  }
  if (issues.length) throw new ValidationError(issues);
  return { ...input, name: name!, color: input.color.toLowerCase() };
}

export function assertFileLimit(
  file: Pick<File, "size" | "name">,
  kind: "import" | "backup" | "image",
): void {
  const max =
    kind === "import"
      ? LIMITS.importBytes
      : kind === "backup"
        ? LIMITS.backupBytes
        : LIMITS.imageBytes;
  if (file.size > max) {
    throw new ValidationError([
      {
        field: file.name,
        message: `Dosya en fazla ${Math.round(max / 1024 / 1024)} MB olabilir.`,
      },
    ]);
  }
}

export function assertRecordLimit(count: number): void {
  if (count > LIMITS.maxRecords) {
    throw new ValidationError([
      {
        field: "records",
        message: `En fazla ${LIMITS.maxRecords.toLocaleString("tr-TR")} kayıt işlenebilir.`,
      },
    ]);
  }
}

export function sanitizeSpreadsheetValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

export function validationMessage(error: unknown): string {
  if (error instanceof ValidationError)
    return error.issues[0]?.message ?? error.message;
  if (error instanceof Error) return error.message;
  return "Beklenmeyen bir hata oluştu.";
}
