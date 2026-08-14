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
  /** Kaydın geldiği fotoğrafın adı; sırayla birden çok fotoğraf işlenebilir. */
  source: string;
}

export interface MediaRow extends DetectedMedia {
  rid: string;
  include: boolean;
  status: MediaStatus;
  duplicate: boolean;
  source: string;
}

export type PhotoImportStep = "pick" | "detecting" | "review";

interface PhotoImportState {
  open: boolean;
  /** İşin başlatıldığı bölüm; iş yokken diyalogu açan bölüm. */
  section: Section;
  step: PhotoImportStep;
  /** Sırada işlenmekte olan fotoğrafın adı. */
  fileName: string;
  /** Sıradaki toplam fotoğraf sayısı. */
  queueTotal: number;
  /** Tamamlanan fotoğraf sayısı; ilerleme göstergesi için. */
  queueDone: number;
  error: string;
  notice: string;
  bookRows: BookRow[];
  mediaRows: MediaRow[];
  /** Diyalog kapalıyken tamamlanan iş; üst çubukta işaret gösterilir. */
  unseen: boolean;

  openDialog: (section: Section) => void;
  closeDialog: () => void;
  start: (files: File[] | FileList, section: Section) => Promise<void>;
  reset: () => void;
  patchBook: (rid: string, patch: Partial<BookRow>) => void;
  patchMedia: (rid: string, patch: Partial<MediaRow>) => void;
  applyBookStatus: (status: BookStatus) => void;
  applyMediaStatus: (status: MediaStatus) => void;
}

const EMPTY_JOB = {
  step: "pick" as PhotoImportStep,
  fileName: "",
  queueTotal: 0,
  queueDone: 0,
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

/** Tek fotoğraflık işte dosya adı gereksiz gürültü; sırada ise ayırt edici. */
const describeFailure = (name: string, error: string, queueLength: number) =>
  queueLength > 1 ? `${name}: ${error}` : error;

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

  start: async (files, section) => {
    const queue = Array.from(files);
    if (queue.length === 0) return;

    const runId = crypto.randomUUID();
    currentRun = runId;
    const alive = () => currentRun === runId;
    set({
      ...EMPTY_JOB,
      section,
      step: "detecting",
      fileName: queue[0].name,
      queueTotal: queue.length,
    });

    /** Sonucu yalnız iş hâlâ güncelse yazar. */
    const settle = (patch: Partial<PhotoImportState>) => {
      if (!alive()) return;
      const closed = !get().open;
      set({ ...patch, unseen: closed });
      if (closed) notifyClosed(patch, queue.length);
    };

    const mediaType: MediaType = section === "movies" ? "film" : "dizi";
    const bookRows: BookRow[] = [];
    const mediaRows: MediaRow[] = [];
    // Kütüphanede zaten olanlar ve bu sırada daha önce görülenler; aynı kitap
    // iki fotoğrafta birden çıkarsa ikinci kez işaretlenir.
    const seenBooks = existingBookKeys();
    const seenMedia = existingMediaKeys();
    const failures: string[] = [];

    for (const [index, file] of queue.entries()) {
      if (!alive()) return;
      set({ fileName: file.name, queueDone: index });

      if (section === "books") {
        const result = await detectBooksFromImage(file);
        if (!alive()) return;
        if (!result.ok) {
          failures.push(describeFailure(file.name, result.error, queue.length));
          continue;
        }
        for (const book of result.books) {
          const key = duplicateKey({
            id: "",
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            status: "okunacak",
            addedAt: "",
            updatedAt: "",
          });
          const duplicate = key != null && seenBooks.has(key);
          if (key) seenBooks.add(key);
          bookRows.push({
            ...book,
            rid: `${index}-${bookRows.length}-${book.title}`,
            include: !duplicate,
            status: "okunacak",
            duplicate,
            source: file.name,
          });
        }
      } else {
        const result = await detectMediaFromImage(file, mediaType);
        if (!alive()) return;
        if (!result.ok) {
          failures.push(describeFailure(file.name, result.error, queue.length));
          continue;
        }
        for (const item of result.items) {
          const key = mediaDuplicateKey(item);
          const duplicate = key != null && seenMedia.has(key);
          if (key) seenMedia.add(key);
          mediaRows.push({
            ...item,
            rid: `${index}-${mediaRows.length}-${item.title}`,
            include: !duplicate,
            status: "izlenecek",
            duplicate,
            source: file.name,
          });
        }
      }

      // Bulunanlar her fotoğraftan sonra yazılır; kullanıcı sıra sürerken
      // ilerlemeyi görür, iş yarıda bırakılırsa da eldekiler kaybolmaz.
      if (!alive()) return;
      set({ bookRows: [...bookRows], mediaRows: [...mediaRows] });
    }

    const found = section === "books" ? bookRows.length : mediaRows.length;
    // Hiçbir sonuç yoksa başarısızlık asıl mesajdır. Sıranın bir kısmı düşmüşse
    // eldekini göstermek daha yararlı; düşenler uyarı olarak bildirilir.
    const failureNotice = `${failures.length} fotoğraf işlenemedi: ${failures.join(" · ")}`;
    settle({
      step: found > 0 ? "review" : "pick",
      queueDone: queue.length,
      bookRows,
      mediaRows,
      error: found === 0 && failures.length > 0 ? failures.join(" · ") : "",
      notice:
        found === 0
          ? failures.length > 0
            ? ""
            : emptyNotice(section)
          : failures.length > 0
            ? failureNotice
            : "",
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
function notifyClosed(patch: Partial<PhotoImportState>, photos: number) {
  const toast = useToast.getState();
  if (patch.error) return toast.show(patch.error, "error");
  if (patch.notice) return toast.show(patch.notice, "info");
  const count = (patch.bookRows?.length ?? 0) + (patch.mediaRows?.length ?? 0);
  toast.show(
    photos > 1
      ? `${photos} fotoğrafta ${count} kayıt bulundu — gözden geçir`
      : `Fotoğrafta ${count} kayıt bulundu — gözden geçir`,
    "info",
  );
}
