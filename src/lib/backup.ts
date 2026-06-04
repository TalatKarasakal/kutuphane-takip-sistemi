import { nanoid } from 'nanoid';
import { db } from '../db/database';
import { downloadBlob } from './utils';
import { useBooks } from '../store/booksStore';
import { useMedia } from '../store/mediaStore';
import { useSettings } from '../store/settingsStore';
import type { Book, BackupFrequency } from '../types/book';
import type { Media } from '../types/media';
import type { DetectBooksPayload, DetectBooksResult } from './ai/detectBooks';

const SCHEMA_VERSION = 1;

export interface Snapshot {
  app: 'kutuphanem';
  version: number;
  exportedAt: string;
  books: Book[];
  media: Media[];
}

export interface BackupFileInfo {
  name: string;
  path: string;
  size: number;
  mtime: number;
}

/** electron/preload.cjs tarafından açılan köprü. */
interface BackupApi {
  write: (json: string) => Promise<{ ok: boolean; path?: string; error?: string }>;
  list: () => Promise<BackupFileInfo[]>;
  read: (path: string) => Promise<string | null>;
  reveal: () => Promise<boolean>;
  lastInfo: () => Promise<{ name: string; mtime: number } | null>;
}

/** electron/preload.cjs tarafından açılan yapay zekâ köprüsü. */
interface AiApi {
  detectBooks: (payload: DetectBooksPayload) => Promise<DetectBooksResult>;
}

declare global {
  interface Window {
    kutuphanem?: { backup: BackupApi; ai: AiApi };
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.kutuphanem?.backup;
}

export async function buildSnapshot(): Promise<Snapshot> {
  const [books, media] = await Promise.all([db.books.toArray(), db.media.toArray()]);
  return { app: 'kutuphanem', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), books, media };
}

export interface CreateBackupResult {
  ok: boolean;
  mode: 'electron' | 'download';
  path?: string;
  error?: string;
}

/** Tam yedek oluşturur: Electron'da sessizce diske yazar, tarayıcıda dosya indirir. */
export async function createBackup(): Promise<CreateBackupResult> {
  const snap = await buildSnapshot();
  const json = JSON.stringify(snap, null, 2);

  if (isElectron()) {
    const res = await window.kutuphanem!.backup.write(json);
    if (res.ok) useSettings.getState().set('lastBackupAt', snap.exportedAt);
    return { ok: res.ok, mode: 'electron', path: res.path, error: res.error };
  }

  const filename = `kutuphanem-yedek-${snap.exportedAt.slice(0, 10)}.json`;
  downloadBlob(new Blob([json], { type: 'application/json' }), filename);
  useSettings.getState().set('lastBackupAt', snap.exportedAt);
  return { ok: true, mode: 'download' };
}

function isDue(freq: BackupFrequency, last?: string): boolean {
  if (freq === 'launch') return true;
  if (!last) return true;
  const elapsed = Date.now() - new Date(last).getTime();
  if (freq === 'weekly') return elapsed >= 7 * 24 * 3600 * 1000;
  return elapsed >= 24 * 3600 * 1000; // daily
}

let autoBackupRan = false;

/** Uygulama açılışında, ayarlara ve son yedek zamanına göre sessiz otomatik yedek alır. */
export async function maybeAutoBackup(): Promise<void> {
  if (autoBackupRan) return;
  autoBackupRan = true;
  if (!isElectron()) return; // tarayıcıda sessiz dosya yazımı mümkün değil

  const { autoBackup, backupFrequency, lastBackupAt } = useSettings.getState();
  if (!autoBackup) return;
  if (!isDue(backupFrequency, lastBackupAt)) return;

  try {
    await createBackup();
  } catch {
    /* otomatik yedek sessizce başarısız olabilir */
  }
}

/** Yedek metnini ayrıştırır. Hem tam snapshot hem de eski {books}/{media} dışa aktarımını kabul eder. */
export function parseSnapshot(text: string): Snapshot | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const books = Array.isArray(obj.books) ? (obj.books as Book[]) : [];
  const media = Array.isArray(obj.media) ? (obj.media as Media[]) : [];
  if (books.length === 0 && media.length === 0) return null;
  return {
    app: 'kutuphanem',
    version: typeof obj.version === 'number' ? obj.version : 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    books,
    media,
  };
}

function normalizeBook(b: Book, now: string): Book {
  return {
    ...b,
    id: typeof b.id === 'string' && b.id ? b.id : nanoid(),
    title: String(b.title ?? ''),
    author: String(b.author ?? ''),
    status: b.status ?? 'mevcut',
    addedAt: b.addedAt ?? now,
    updatedAt: b.updatedAt ?? now,
  };
}

function normalizeMedia(m: Media, now: string): Media {
  return {
    ...m,
    id: typeof m.id === 'string' && m.id ? m.id : nanoid(),
    title: String(m.title ?? ''),
    type: m.type === 'film' || m.type === 'dizi' ? m.type : 'film',
    status: m.status ?? 'izlenecek',
    addedAt: m.addedAt ?? now,
    updatedAt: m.updatedAt ?? now,
  };
}

export interface RestoreResult {
  ok: boolean;
  books: number;
  media: number;
  error?: string;
}

/**
 * Yedeği geri yükler: tüm veriyi değiştirir. Varsayılan olarak değiştirmeden önce
 * bir güvenlik yedeği alır (Electron'da diske, tarayıcıda atlanır).
 */
export async function restoreSnapshot(text: string, opts?: { safety?: boolean }): Promise<RestoreResult> {
  const snap = parseSnapshot(text);
  if (!snap) return { ok: false, books: 0, media: 0, error: 'Geçersiz veya boş yedek dosyası.' };

  if (opts?.safety !== false && isElectron()) {
    try {
      await createBackup();
    } catch {
      /* güvenlik yedeği alınamazsa geri yüklemeyi yine de sürdür */
    }
  }

  const now = new Date().toISOString();
  const books = snap.books.map((b) => normalizeBook(b, now));
  const media = snap.media.map((m) => normalizeMedia(m, now));

  await db.transaction('rw', db.books, db.media, async () => {
    await db.books.clear();
    await db.media.clear();
    if (books.length) await db.books.bulkAdd(books);
    if (media.length) await db.media.bulkAdd(media);
  });

  await useBooks.getState().load();
  await useMedia.getState().load();

  return { ok: true, books: books.length, media: media.length };
}
