import { create } from "zustand";
import { detectBooksFromImage, type DetectedBook } from "../lib/ai/detectBooks";
import {
  detectMediaFromImage,
  type DetectedMedia,
} from "../lib/ai/detectMedia";
import { duplicateKey, mediaDuplicateKey } from "../lib/filters";
import { useBooks } from "./booksStore";
import { useMedia } from "./mediaStore";
import { useToast } from "./toastStore";
import type { BookStatus } from "../types/book";
import type { MediaStatus, MediaType } from "../types/media";
import type { Section } from "../types/library";

export interface BookRow extends DetectedBook {
  rid: string;
  include: boolean;
  status: BookStatus;
  duplicate: boolean;
}

export interface MediaRow extends DetectedMedia {
  rid: string;
  include: boolean;
  status: MediaStatus;
  duplicate: boolean;
}

export type PhotoImportStep = "pick" | "detecting" | "review";

interface PhotoImportState {
  open: boolean;
  /** İşin başlatıldığı bölüm; iş yokken diyalogu açan bölüm. */
  section: Section;
  step: PhotoImportStep;
  fileName: string;
  error: string;
  notice: string;
  bookRows: BookRow[];
  mediaRows: MediaRow[];
  /** Diyalog kapalıyken tamamlanan iş; üst çubukta işaret gösterilir. */
  unseen: boolean;

  openDialog: (section: Section) => void;
  closeDialog: () => void;
  start: (file: File, section: Section) => Promise<void>;
  reset: () => void;
  patchBook: (rid: string, patch: Partial<BookRow>) => void;
  patchMedia: (rid: string, patch: Partial<MediaRow>) => void;
  applyBookStatus: (status: BookStatus) => void;
  applyMediaStatus: (status: MediaStatus) => void;
}

const EMPTY_JOB = {
  step: "pick" as PhotoImportStep,
  fileName: "",
  error: "",
  notice: "",
  bookRows: [] as BookRow[],
  mediaRows: [] as MediaRow[],
  unseen: false,
};

/**
 * Çalışan işin kimliği. Kullanıcı işi bırakıp yenisini başlatırsa geç gelen
 * sonuç ekrana basılmasın diye tutulur.
 */
let currentRun: string | null = null;

function existingBookKeys(): Set<string> {
  const keys = new Set<string>();
  useBooks.getState().books.forEach((book) => {
    const key = duplicateKey(book);
    if (key) keys.add(key);
  });
  return keys;
}

function existingMediaKeys(): Set<string> {
  const keys = new Set<string>();
  useMedia.getState().media.forEach((item) => {
    const key = mediaDuplicateKey(item);
    if (key) keys.add(key);
  });
  return keys;
}

const emptyNotice = (section: Section) =>
  section === "books"
    ? "Bu fotoğrafta kitap algılanamadı. Sırtların/kapakların daha net göründüğü bir fotoğrafla tekrar dene."
    : section === "movies"
      ? "Bu fotoğrafta film algılanamadı. Afişlerin/kapakların daha net göründüğü bir fotoğrafla tekrar dene."
      : "Bu fotoğrafta dizi algılanamadı. Afişlerin/kapakların daha net göründüğü bir fotoğrafla tekrar dene.";

/**
 * Fotoğraftan ekleme işini diyalogdan bağımsız tutar. Algılama uzun sürdüğü
 * (özellikle yerel modelde dakikaları bulabildiği) için kullanıcı diyaloğu
 * kapatıp uygulamayı kullanmaya devam edebilir; iş arka planda sürer ve
 * bittiğinde üst çubuktaki göstergeden geri dönülür.
 *
 * Aynı anda tek iş çalışır; yeni bir fotoğraf başlatmak öncekini bırakır.
 */
export const usePhotoImport = create<PhotoImportState>((set, get) => ({
  open: false,
  section: "books",
  ...EMPTY_JOB,

  // Çalışan ya da sonucu bekleyen bir iş varsa diyalog onun bölümüne döner;
  // yoksa çağıran bölüm için açılır.
  openDialog: (section) =>
    set({
      open: true,
      unseen: false,
      section: get().step === "pick" ? section : get().section,
    }),
  closeDialog: () => set({ open: false }),

  start: async (file, section) => {
    const runId = crypto.randomUUID();
    currentRun = runId;
    set({ ...EMPTY_JOB, section, step: "detecting", fileName: file.name });

    /** Sonucu yalnız iş hâlâ güncelse yazar. */
    const settle = (patch: Partial<PhotoImportState>) => {
      if (currentRun !== runId) return;
      const closed = !get().open;
      set({ ...patch, unseen: closed });
      if (closed) notifyClosed(patch);
    };

    if (section === "books") {
      const result = await detectBooksFromImage(file);
      if (!result.ok) return settle({ step: "pick", error: result.error });
      if (result.books.length === 0)
        return settle({ step: "pick", notice: emptyNotice(section) });
      const seen = existingBookKeys();
      settle({
        step: "review",
        bookRows: result.books.map((book, index) => {
          const key = duplicateKey({
            id: "",
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            status: "okunacak",
            addedAt: "",
            updatedAt: "",
          });
          const duplicate = key != null && seen.has(key);
          return {
            ...book,
            rid: `${index}-${book.title}`,
            include: !duplicate,
            status: "okunacak" as BookStatus,
            duplicate,
          };
        }),
      });
      return;
    }

    const mediaType: MediaType = section === "movies" ? "film" : "dizi";
    const result = await detectMediaFromImage(file, mediaType);
    if (!result.ok) return settle({ step: "pick", error: result.error });
    if (result.items.length === 0)
      return settle({ step: "pick", notice: emptyNotice(section) });
    const seen = existingMediaKeys();
    settle({
      step: "review",
      mediaRows: result.items.map((item, index) => {
        const key = mediaDuplicateKey(item);
        const duplicate = key != null && seen.has(key);
        return {
          ...item,
          rid: `${index}-${item.title}`,
          include: !duplicate,
          status: "izlenecek" as MediaStatus,
          duplicate,
        };
      }),
    });
  },

  reset: () => {
    currentRun = null;
    set({ ...EMPTY_JOB });
  },

  patchBook: (rid, patch) =>
    set({
      bookRows: get().bookRows.map((row) =>
        row.rid === rid ? { ...row, ...patch } : row,
      ),
    }),
  patchMedia: (rid, patch) =>
    set({
      mediaRows: get().mediaRows.map((row) =>
        row.rid === rid ? { ...row, ...patch } : row,
      ),
    }),
  applyBookStatus: (status) =>
    set({ bookRows: get().bookRows.map((row) => ({ ...row, status })) }),
  applyMediaStatus: (status) =>
    set({ mediaRows: get().mediaRows.map((row) => ({ ...row, status })) }),
}));

/** Diyalog kapalıyken biten işin sonucunu bildirimle duyurur. */
function notifyClosed(patch: Partial<PhotoImportState>) {
  const toast = useToast.getState();
  if (patch.error) return toast.show(patch.error, "error");
  if (patch.notice) return toast.show(patch.notice, "info");
  const count = (patch.bookRows ?? patch.mediaRows ?? []).length;
  toast.show(`Fotoğrafta ${count} kayıt bulundu — gözden geçir`, "info");
}
