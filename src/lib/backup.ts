import { db } from "../db/database";
import { downloadBlob } from "./utils";
import { useBooks } from "../store/booksStore";
import { useMedia } from "../store/mediaStore";
import { useTags } from "../store/tagsStore";
import { useLoans } from "../store/loansStore";
import { useSettings } from "../store/settingsStore";
import {
  LIMITS,
  ValidationError,
  assertRecordLimit,
  normalizeActiveLoan,
  normalizeBookDraft,
  normalizeMediaDraft,
  normalizeTag,
  validationMessage,
} from "./validation";
import type { Book, BackupFrequency } from "../types/book";
import type { Media } from "../types/media";
import type { ActiveLoan, Tag } from "../types/library";
import { TAG_COLORS } from "../types/library";
import type { BackupFileInfo } from "../types/bridge";

const SCHEMA_VERSION = 2;
const RESTORE_CHUNK_SIZE = 500;

export interface Snapshot {
  app: "kutuphanem";
  version: 2;
  exportedAt: string;
  books: Book[];
  media: Media[];
  tags: Tag[];
  activeLoans: ActiveLoan[];
}

export interface BackupPreview {
  info: BackupFileInfo;
  exportedAt: string;
  books: number;
  media: number;
  tags: number;
  activeLoans: number;
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.kutuphanem?.backup;
}

export async function buildSnapshot(): Promise<Snapshot> {
  const [books, media, tags, activeLoans] = await Promise.all([
    db.books.toArray(),
    db.media.toArray(),
    db.tags.toArray(),
    db.activeLoans.toArray(),
  ]);
  return {
    app: "kutuphanem",
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    books,
    media,
    tags,
    activeLoans,
  };
}

export interface CreateBackupResult {
  ok: boolean;
  mode: "electron" | "download";
  path?: string;
  error?: string;
}

export async function createBackup(): Promise<CreateBackupResult> {
  const snapshot = await buildSnapshot();
  const json = JSON.stringify(snapshot, null, 2);
  if (new Blob([json]).size > LIMITS.backupBytes) {
    return {
      ok: false,
      mode: isElectron() ? "electron" : "download",
      error: "Yedek 100 MB sınırını aşıyor.",
    };
  }
  if (isElectron()) {
    const result = await window.kutuphanem!.backup.write(json);
    if (result.ok)
      useSettings.getState().set("lastBackupAt", snapshot.exportedAt);
    return { ...result, mode: "electron" };
  }
  downloadBlob(
    new Blob([json], { type: "application/json" }),
    `kutuphanem-yedek-${snapshot.exportedAt.slice(0, 10)}.json`,
  );
  useSettings.getState().set("lastBackupAt", snapshot.exportedAt);
  return { ok: true, mode: "download" };
}

function isDue(frequency: BackupFrequency, last?: string): boolean {
  if (frequency === "launch") return true;
  if (!last) return true;
  const elapsed = Date.now() - new Date(last).getTime();
  return elapsed >= (frequency === "weekly" ? 7 : 1) * 24 * 3600 * 1000;
}

let autoBackupRan = false;

export async function maybeAutoBackup(): Promise<void> {
  if (autoBackupRan) return;
  autoBackupRan = true;
  if (!isElectron()) return;
  const { autoBackup, backupFrequency, lastBackupAt } = useSettings.getState();
  if (!autoBackup || !isDue(backupFrequency, lastBackupAt)) return;
  const result = await createBackup().catch((error) => ({
    ok: false,
    mode: "electron" as const,
    error: validationMessage(error),
  }));
  if (!result.ok) throw new Error(result.error ?? "Otomatik yedek alınamadı.");
}

function assertUniqueIds(items: Array<{ id?: unknown }>, field: string): void {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (typeof item.id !== "string" || !item.id.trim()) {
      throw new ValidationError([
        { field: `${field}[${index}].id`, message: "Kimlik zorunludur." },
      ]);
    }
    if (ids.has(item.id))
      throw new ValidationError([
        { field: `${field}[${index}].id`, message: "Mükerrer kimlik bulundu." },
      ]);
    ids.add(item.id);
  });
}

function validTimestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new ValidationError([
      { field, message: "Geçerli ISO tarih-saat değeri olmalı." },
    ]);
  }
  return value;
}

function normalizeBookRecord(
  raw: Record<string, unknown>,
  index: number,
): Book {
  const id = String(raw.id ?? "").trim();
  if (!id)
    throw new ValidationError([
      { field: `books[${index}].id`, message: "Kimlik zorunludur." },
    ]);
  const draft = normalizeBookDraft(raw);
  return {
    ...draft,
    id,
    addedAt: validTimestamp(raw.addedAt, `books[${index}].addedAt`),
    updatedAt: validTimestamp(raw.updatedAt, `books[${index}].updatedAt`),
  };
}

function normalizeMediaRecord(
  raw: Record<string, unknown>,
  index: number,
): Media {
  const id = String(raw.id ?? "").trim();
  if (!id)
    throw new ValidationError([
      { field: `media[${index}].id`, message: "Kimlik zorunludur." },
    ]);
  const draft = normalizeMediaDraft(raw);
  return {
    ...draft,
    id,
    addedAt: validTimestamp(raw.addedAt, `media[${index}].addedAt`),
    updatedAt: validTimestamp(raw.updatedAt, `media[${index}].updatedAt`),
  };
}

function migrateLegacyTags(
  rawBooks: Array<Record<string, unknown>>,
  books: Book[],
): Tag[] {
  const tags = new Map<string, Tag>();
  rawBooks.forEach((raw, index) => {
    if (!Array.isArray(raw.tags)) return;
    const ids: string[] = [];
    raw.tags.forEach((value) => {
      if (typeof value !== "string" || !value.trim()) return;
      const name = value.trim();
      const id = `legacy:${encodeURIComponent(name.toLocaleLowerCase("tr"))}`;
      ids.push(id);
      if (!tags.has(id)) {
        const now = new Date().toISOString();
        tags.set(id, {
          id,
          name,
          color: TAG_COLORS[tags.size % TAG_COLORS.length],
          createdAt: now,
          updatedAt: now,
        });
      }
    });
    if (ids.length) books[index].tagIds = [...new Set(ids)];
  });
  return [...tags.values()];
}

export function parseSnapshot(text: string): Snapshot {
  if (new Blob([text]).size > LIMITS.backupBytes) {
    throw new ValidationError([
      { field: "backup", message: "Yedek 100 MB sınırını aşıyor." },
    ]);
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ValidationError([
      { field: "backup", message: "Yedek geçerli JSON değil." },
    ]);
  }
  if (!value || typeof value !== "object")
    throw new ValidationError([
      { field: "backup", message: "Yedek nesnesi bulunamadı." },
    ]);
  const raw = value as Record<string, unknown>;
  const version = raw.version == null ? 1 : Number(raw.version);
  if (version !== 1 && version !== 2)
    throw new ValidationError([
      { field: "version", message: `Desteklenmeyen yedek sürümü: ${version}` },
    ]);
  if (version === 2 && raw.app !== "kutuphanem") {
    throw new ValidationError([
      { field: "app", message: "Dosya Kütüphanem yedeği değil." },
    ]);
  }
  if (!Array.isArray(raw.books) || !Array.isArray(raw.media)) {
    throw new ValidationError([
      { field: "backup", message: "Kitap veya medya dizisi eksik." },
    ]);
  }
  const rawTags =
    version === 2 && Array.isArray(raw.tags)
      ? (raw.tags as Array<Record<string, unknown>>)
      : [];
  const rawLoans =
    version === 2 && Array.isArray(raw.activeLoans)
      ? (raw.activeLoans as Array<Record<string, unknown>>)
      : [];
  assertRecordLimit(
    raw.books.length + raw.media.length + rawTags.length + rawLoans.length,
  );
  assertUniqueIds(raw.books as Array<{ id?: unknown }>, "books");
  assertUniqueIds(raw.media as Array<{ id?: unknown }>, "media");
  const rawBooks = raw.books as Array<Record<string, unknown>>;
  const books = rawBooks.map(normalizeBookRecord);
  const media = (raw.media as Array<Record<string, unknown>>).map(
    normalizeMediaRecord,
  );
  if (version === 2) assertUniqueIds(rawTags, "tags");
  let tags =
    version === 1
      ? migrateLegacyTags(rawBooks, books)
      : rawTags.map((item, index) =>
          normalizeTag({
            id: String(item.id ?? "").trim(),
            name: String(item.name ?? ""),
            color: String(item.color ?? ""),
            createdAt: validTimestamp(
              item.createdAt,
              `tags[${index}].createdAt`,
            ),
            updatedAt: validTimestamp(
              item.updatedAt,
              `tags[${index}].updatedAt`,
            ),
          }),
        );
  let activeLoans =
    version === 2
      ? rawLoans.map((item) =>
          normalizeActiveLoan(item as unknown as ActiveLoan),
        )
      : [];
  assertUniqueIds(tags, "tags");
  const tagIds = new Set(tags.map((tag) => tag.id));
  books.forEach((book) => {
    book.tagIds = book.tagIds?.filter((id) => tagIds.has(id));
  });
  media.forEach((item) => {
    item.tagIds = item.tagIds?.filter((id) => tagIds.has(id));
  });
  const bookIds = new Set(books.map((book) => book.id));
  const loanBookIds = new Set<string>();
  activeLoans = activeLoans.filter((loan) => {
    if (!bookIds.has(loan.bookId))
      throw new ValidationError([
        {
          field: "activeLoans",
          message: "Ödünç kaydı bulunmayan kitaba bağlı.",
        },
      ]);
    if (loanBookIds.has(loan.bookId))
      throw new ValidationError([
        {
          field: "activeLoans",
          message: "Aynı kitap için birden fazla aktif ödünç kaydı var.",
        },
      ]);
    loanBookIds.add(loan.bookId);
    return true;
  });
  tags = tags.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const exportedAt = validTimestamp(
    raw.exportedAt ?? new Date().toISOString(),
    "exportedAt",
  );
  return {
    app: "kutuphanem",
    version: 2,
    exportedAt,
    books,
    media,
    tags,
    activeLoans,
  };
}

export async function listBackupPreviews(): Promise<BackupPreview[]> {
  if (!isElectron()) return [];
  const infos = await window.kutuphanem!.backup.list();
  const previews = await Promise.all(
    infos.map(async (info) => {
      const text = await window.kutuphanem!.backup.read(info.path);
      if (!text) return null;
      try {
        const snapshot = parseSnapshot(text);
        return {
          info,
          exportedAt: snapshot.exportedAt,
          books: snapshot.books.length,
          media: snapshot.media.length,
          tags: snapshot.tags.length,
          activeLoans: snapshot.activeLoans.length,
        } satisfies BackupPreview;
      } catch {
        return {
          info,
          exportedAt: new Date(info.mtime).toISOString(),
          books: -1,
          media: -1,
          tags: -1,
          activeLoans: -1,
        } satisfies BackupPreview;
      }
    }),
  );
  return previews.filter(
    (preview): preview is BackupPreview => preview != null,
  );
}

export async function readBackup(path: string): Promise<string> {
  if (!isElectron())
    throw new Error(
      "Yedek geçmişi yalnız masaüstü uygulamasında kullanılabilir.",
    );
  const text = await window.kutuphanem!.backup.read(path);
  if (!text) throw new Error("Yedek dosyası okunamadı.");
  return text;
}

export interface RestoreResult {
  ok: boolean;
  books: number;
  media: number;
  tags: number;
  activeLoans: number;
  error?: string;
}

export async function restoreSnapshot(
  text: string,
  options?: { safety?: boolean },
): Promise<RestoreResult> {
  try {
    const snapshot = parseSnapshot(text);
    if (options?.safety !== false && isElectron()) {
      const safety = await createBackup();
      if (!safety.ok)
        throw new Error(
          `Güvenlik yedeği alınamadı: ${safety.error ?? "bilinmeyen hata"}`,
        );
    }
    await db.transaction(
      "rw",
      db.books,
      db.media,
      db.tags,
      db.activeLoans,
      async () => {
        await db.activeLoans.clear();
        await db.books.clear();
        await db.media.clear();
        await db.tags.clear();

        for (
          let offset = 0;
          offset < snapshot.tags.length;
          offset += RESTORE_CHUNK_SIZE
        ) {
          await db.tags.bulkAdd(
            snapshot.tags.slice(offset, offset + RESTORE_CHUNK_SIZE),
          );
        }
        for (
          let offset = 0;
          offset < snapshot.books.length;
          offset += RESTORE_CHUNK_SIZE
        ) {
          await db.books.bulkAdd(
            snapshot.books.slice(offset, offset + RESTORE_CHUNK_SIZE),
          );
        }
        for (
          let offset = 0;
          offset < snapshot.media.length;
          offset += RESTORE_CHUNK_SIZE
        ) {
          await db.media.bulkAdd(
            snapshot.media.slice(offset, offset + RESTORE_CHUNK_SIZE),
          );
        }
        for (
          let offset = 0;
          offset < snapshot.activeLoans.length;
          offset += RESTORE_CHUNK_SIZE
        ) {
          await db.activeLoans.bulkAdd(
            snapshot.activeLoans.slice(offset, offset + RESTORE_CHUNK_SIZE),
          );
        }
      },
    );
    await Promise.all([
      useBooks.getState().load(),
      useMedia.getState().load(),
      useTags.getState().load(),
      useLoans.getState().load(),
    ]);
    return {
      ok: true,
      books: snapshot.books.length,
      media: snapshot.media.length,
      tags: snapshot.tags.length,
      activeLoans: snapshot.activeLoans.length,
    };
  } catch (error) {
    return {
      ok: false,
      books: 0,
      media: 0,
      tags: 0,
      activeLoans: 0,
      error: validationMessage(error),
    };
  }
}

export type { BackupFileInfo };
