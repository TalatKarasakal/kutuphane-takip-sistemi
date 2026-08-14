import { useEffect, useState } from "react";
import {
  Upload,
  Loader2,
  AlertTriangle,
  Sparkles,
  Settings,
  ImagePlus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useBooks } from "../../store/booksStore";
import { useMedia } from "../../store/mediaStore";
import {
  usePhotoImport,
  type BookRow,
  type MediaRow,
} from "../../store/photoImportStore";
import { aiReadiness, type AiReadiness } from "../../lib/ai/provider";
import { STATUSES } from "../../constants/statuses";
import { MEDIA_STATUSES } from "../../constants/mediaStatuses";
import type { Book, BookStatus } from "../../types/book";
import type { MediaStatus, MediaType } from "../../types/media";
import type { MediaDraft } from "../../lib/validation";
import type { Section } from "../../types/library";

interface Props {
  onOpenSettings: () => void;
}

/** Bölüme göre değişen metinler; geri kalan akış üç bölümde de aynıdır. */
const COPY: Record<
  Section,
  { title: string; dropTitle: string; dropHint: string }
> = {
  books: {
    title: "Fotoğraftan Kitap Ekle",
    dropTitle: "Kitap fotoğraflarını seç ya da buraya sürükle-bırak",
    dropHint:
      ".jpg · .png · .webp — birden çok fotoğraf seçebilirsin, sırayla işlenir. Sırtların/kapakların net göründüğü fotoğraflar en iyi sonucu verir",
  },
  movies: {
    title: "Fotoğraftan Film Ekle",
    dropTitle: "Film fotoğraflarını seç ya da buraya sürükle-bırak",
    dropHint:
      ".jpg · .png · .webp — birden çok fotoğraf seçebilirsin, sırayla işlenir. Afiş, DVD/Blu-ray kapağı ya da yayın listesi ekran görüntüsü kullanabilirsin",
  },
  tv: {
    title: "Fotoğraftan Dizi Ekle",
    dropTitle: "Dizi fotoğraflarını seç ya da buraya sürükle-bırak",
    dropHint:
      ".jpg · .png · .webp — birden çok fotoğraf seçebilirsin, sırayla işlenir. Afiş, kutu kapağı ya da yayın listesi ekran görüntüsü kullanabilirsin",
  },
};

/**
 * Algılama işi mağazada durduğu için bu diyalog yalnızca bir görünümdür:
 * kapatılıp yeniden açılsa da çalışan iş ve gözden geçirme listesi korunur.
 */
export function PhotoImportDialog({ onOpenSettings }: Props) {
  const { addMany: addBooks } = useBooks();
  const { addMany: addMedia } = useMedia();
  const {
    open,
    section,
    step,
    fileName,
    queueTotal,
    queueDone,
    error,
    notice,
    bookRows,
    mediaRows,
    closeDialog,
    start,
    reset,
    patchBook,
    patchMedia,
    applyBookStatus,
    applyMediaStatus,
  } = usePhotoImport();

  const [readiness, setReadiness] = useState<AiReadiness | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isBooks = section === "books";
  const mediaType: MediaType = section === "movies" ? "film" : "dizi";
  const copy = COPY[section];

  useEffect(() => {
    if (open) void aiReadiness().then(setReadiness);
  }, [open]);

  const close = () => {
    setSaveError("");
    closeDialog();
  };

  const includedCount = isBooks
    ? bookRows.filter((r) => r.include && r.title.trim()).length
    : mediaRows.filter((r) => r.include && r.title.trim()).length;

  const doAdd = async () => {
    if (saving || includedCount === 0) return;
    setSaving(true);
    setSaveError("");
    try {
      if (isBooks) {
        const toAdd: Omit<Book, "id" | "addedAt" | "updatedAt">[] = bookRows
          .filter((r) => r.include && r.title.trim())
          .map((r) => ({
            title: r.title.trim(),
            author: r.author.trim(),
            status: r.status,
            publisher: r.publisher,
            pageCount: r.pageCount,
            publicationYear: r.publicationYear,
            isbn: r.isbn,
            genre: r.genre,
            language: r.language,
            coverUrl: r.coverUrl,
          }));
        await addBooks(toAdd);
      } else {
        const toAdd: MediaDraft[] = mediaRows
          .filter((r) => r.include && r.title.trim())
          .map((r) => ({
            title: r.title.trim(),
            type: mediaType,
            director: r.director?.trim() || undefined,
            genre: r.genre?.trim() || undefined,
            releaseYear: r.releaseYear,
            duration: r.duration,
            seasons: r.seasons,
            episodeDuration: r.episodeDuration,
            status: r.status,
          }));
        await addMedia(toAdd);
      }
      reset();
      close();
    } catch (caught) {
      setSaveError(
        caught instanceof Error ? caught.message : "Kayıtlar eklenemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addLabel =
    includedCount > 0
      ? isBooks
        ? `${includedCount} Kitabı Ekle`
        : `${includedCount} Kaydı Ekle`
      : "Ekle";

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title={
        copy.title +
        (step === "pick"
          ? ""
          : queueTotal > 1
            ? ` · ${queueTotal} fotoğraf`
            : fileName
              ? ` · ${fileName}`
              : "")
      }
      footer={
        step === "review" ? (
          <>
            <button className="btn btn-ghost" onClick={reset} disabled={saving}>
              Baştan
            </button>
            <button className="btn btn-ghost" onClick={close} disabled={saving}>
              Kapat
            </button>
            <button
              className="btn btn-primary"
              onClick={() => void doAdd()}
              disabled={saving || includedCount === 0}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Ekleniyor…
                </>
              ) : (
                addLabel
              )}
            </button>
          </>
        ) : step === "detecting" ? (
          <>
            <button className="btn btn-ghost" onClick={reset}>
              Vazgeç
            </button>
            <button className="btn btn-primary" onClick={close}>
              Arka Planda Sürdür
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={close}>
            Kapat
          </button>
        )
      }
    >
      {saveError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-accent bg-accent-soft px-3 py-2 text-sm text-accent"
        >
          {saveError}
        </div>
      )}
      {step === "pick" && (
        <PickStep
          readiness={readiness}
          error={error}
          notice={notice}
          dropTitle={copy.dropTitle}
          dropHint={copy.dropHint}
          enrichHint={
            isBooks
              ? "Yapay zekâ kitapları tanır, künyeyi (yayınevi, sayfa, kapak) Google Books'tan tamamlar; eklemeden önce listeyi gözden geçirip onaylarsın."
              : "Yapay zekâ yapımları tanır ve bildiği künyeyi (yönetmen, yıl, tür) doldurur; eklemeden önce listeyi gözden geçirip onaylarsın."
          }
          onFiles={(files) => void start(files, section)}
          onOpenSettings={() => {
            close();
            onOpenSettings();
          }}
        />
      )}
      {step === "detecting" && (
        <DetectingStep
          isBooks={isBooks}
          local={readiness?.provider === "local"}
          fileName={fileName}
          queueTotal={queueTotal}
          queueDone={queueDone}
          found={isBooks ? bookRows.length : mediaRows.length}
        />
      )}
      {step === "review" &&
        (isBooks ? (
          <BookReviewStep
            rows={bookRows}
            onPatch={patchBook}
            onApplyAll={applyBookStatus}
          />
        ) : (
          <MediaReviewStep
            rows={mediaRows}
            type={mediaType}
            onPatch={patchMedia}
            onApplyAll={applyMediaStatus}
          />
        ))}
    </Modal>
  );
}

function PickStep({
  readiness,
  error,
  notice,
  dropTitle,
  dropHint,
  enrichHint,
  onFiles,
  onOpenSettings,
}: {
  readiness: AiReadiness | null;
  error: string;
  notice: string;
  dropTitle: string;
  dropHint: string;
  enrichHint: string;
  onFiles: (files: File[]) => void;
  onOpenSettings: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  if (!readiness) return <div className="py-16" aria-busy="true" />;

  if (!readiness.ready) {
    return (
      <div className="py-8 text-center">
        <Sparkles size={28} className="mx-auto mb-3 text-accent" />
        <div className="font-medium mb-1">Yapay zekâ henüz hazır değil</div>
        <div className="text-sm text-mute max-w-md mx-auto mb-4">
          {readiness.reason}
        </div>
        <div className="text-xs text-mute max-w-md mx-auto mb-4">
          Bulut yerine bilgisayarındaki bir modeli de kullanabilirsin; o zaman
          fotoğraf hiç bu bilgisayardan çıkmaz.
        </div>
        <button className="btn btn-primary" onClick={onOpenSettings}>
          <Settings size={15} /> Ayarları Aç
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-accent bg-accent-soft px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 text-accent shrink-0" />
          <div className="text-accent">{error}</div>
        </div>
      )}
      {notice && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-line-strong bg-accent-soft px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 text-mute shrink-0" />
          <div className="text-dim">{notice}</div>
        </div>
      )}
      <label
        className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-accent bg-accent-soft" : "border-line hover:bg-hover"}`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          const files = Array.from(e.dataTransfer.files ?? []);
          if (files.length) onFiles(files);
        }}
      >
        <ImagePlus size={28} className="mx-auto mb-3 text-accent" />
        <div className="font-medium mb-1">{dropTitle}</div>
        <div className="text-sm text-mute mb-4">{dropHint}</div>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFiles(files);
            e.target.value = "";
          }}
        />
        <span className="btn btn-primary">
          <Upload size={15} /> Fotoğraf Seç
        </span>
      </label>
      <div className="text-xs text-mute mt-3 flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" />
        <span>{enrichHint}</span>
      </div>
    </div>
  );
}

function DetectingStep({
  isBooks,
  local,
  fileName,
  queueTotal,
  queueDone,
  found,
}: {
  isBooks: boolean;
  local: boolean;
  fileName: string;
  queueTotal: number;
  queueDone: number;
  found: number;
}) {
  const multiple = queueTotal > 1;
  return (
    <div className="py-16 text-center">
      <Loader2 size={32} className="mx-auto mb-4 text-accent animate-spin" />
      <div className="font-medium mb-1">
        {multiple
          ? `Fotoğraf ${queueDone + 1} / ${queueTotal} inceleniyor…`
          : "Fotoğraf inceleniyor…"}
      </div>
      {multiple && (
        <>
          <div
            className="mx-auto mt-3 mb-3 h-1.5 w-64 overflow-hidden rounded-full bg-hover"
            role="progressbar"
            aria-valuenow={queueDone}
            aria-valuemin={0}
            aria-valuemax={queueTotal}
            aria-label="Fotoğraf sırası ilerlemesi"
          >
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${(queueDone / queueTotal) * 100}%` }}
            />
          </div>
          <div className="text-sm text-mute truncate px-4">
            {fileName}
            {found > 0 && ` · şu ana dek ${found} kayıt bulundu`}
          </div>
        </>
      )}
      <div className="text-sm text-mute mt-2">
        {isBooks ? "Kitaplar" : "Yapımlar"} tanınıyor ve künyeleri tamamlanıyor.{" "}
        {local
          ? "Yerel model kullanılıyor; her fotoğraf yaklaşık yarım dakika sürebilir, ilk çalıştırmada model belleğe yüklenirken daha uzun."
          : "Bu birkaç saniye sürebilir."}
      </div>
      <div className="text-sm text-mute mt-3">
        Bu pencereyi kapatıp uygulamayı kullanmaya devam edebilirsin; iş arka
        planda sürer ve bitince üst çubuktan haber verilir.
      </div>
    </div>
  );
}

function ReviewShell({
  selectedCount,
  children,
  quickStatus,
  warning,
}: {
  selectedCount: number;
  children: React.ReactNode;
  quickStatus: React.ReactNode;
  warning: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mute">Tümünü şu listeye al:</span>
          <div className="inline-flex border border-line rounded-lg bg-panel overflow-hidden">
            {quickStatus}
          </div>
        </div>
        <div className="chip !bg-transparent border-success text-success">
          <CheckCircle2 size={12} /> {selectedCount} seçili
        </div>
      </div>

      <div className="card overflow-hidden">{children}</div>

      <div className="text-xs text-mute flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-mute" />
        <span>{warning}</span>
      </div>
    </div>
  );
}

function BookReviewStep({
  rows,
  onPatch,
  onApplyAll,
}: {
  rows: BookRow[];
  onPatch: (rid: string, patch: Partial<BookRow>) => void;
  onApplyAll: (status: BookStatus) => void;
}) {
  // Kaynak fotoğraf yalnız birden çok fotoğraf işlendiyse anlamlı bir bilgi.
  const multiSource = new Set(rows.map((r) => r.source)).size > 1;
  return (
    <ReviewShell
      selectedCount={rows.filter((r) => r.include && r.title.trim()).length}
      warning="Yapay zekâ yanılabilir — başlık/yazarı kontrol et, gerekirse düzelt. İşaretli olanlar eklenecek."
      quickStatus={
        <>
          <button
            className="px-3 py-1.5 text-sm hover:bg-hover"
            onClick={() => onApplyAll("okunacak")}
          >
            Okunacak
          </button>
          <button
            className="px-3 py-1.5 text-sm hover:bg-hover border-l border-line"
            onClick={() => onApplyAll("satin-alinacak")}
          >
            Satın Alınacak
          </button>
        </>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-hover text-xs uppercase text-mute">
          <tr>
            <th className="px-2 py-2 w-8"></th>
            <th className="px-2 py-2 w-10"></th>
            <th className="px-3 py-2 text-left">Başlık</th>
            <th className="px-3 py-2 text-left">Yazar</th>
            <th className="px-3 py-2 text-left w-44">Liste</th>
            <th className="px-2 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.rid}
              className={`border-t border-line ${r.include ? "" : "opacity-50"}`}
            >
              <td className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  aria-label={`${r.title} kaydını ekle`}
                  className="row-check accent-[var(--accent)] w-4 h-4"
                  checked={r.include}
                  onChange={(e) =>
                    onPatch(r.rid, { include: e.target.checked })
                  }
                />
              </td>
              <td className="px-2 py-2">
                <div
                  className="grid h-11 w-8 place-items-center rounded border border-line bg-hover text-[9px] text-mute"
                  title={r.coverUrl ? "Kapak bağlantısı bulundu" : undefined}
                >
                  {r.coverUrl ? "Kapak" : "—"}
                </div>
              </td>
              <td className="px-3 py-2">
                <input
                  className="input py-1"
                  aria-label="Başlık"
                  value={r.title}
                  onChange={(e) => onPatch(r.rid, { title: e.target.value })}
                />
                <div className="mt-1 flex items-center gap-2">
                  {r.duplicate && <span className="chip">listede var</span>}
                  {!r.matched && (
                    <span className="text-[11px] text-mute">
                      künye bulunamadı
                    </span>
                  )}
                  {r.publicationYear && (
                    <span className="text-[11px] text-mute">
                      {r.publicationYear}
                    </span>
                  )}
                  {multiSource && r.source && (
                    <span className="text-[11px] text-mute truncate max-w-[10rem]">
                      {r.source}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <input
                  className="input py-1"
                  aria-label="Yazar"
                  value={r.author}
                  placeholder="—"
                  onChange={(e) => onPatch(r.rid, { author: e.target.value })}
                />
                {r.publisher && (
                  <div className="text-[11px] text-mute mt-1 truncate">
                    {r.publisher}
                  </div>
                )}
              </td>
              <td className="px-3 py-2">
                <select
                  className="input py-1"
                  aria-label="Liste"
                  value={r.status}
                  onChange={(e) =>
                    onPatch(r.rid, { status: e.target.value as BookStatus })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  className="btn btn-ghost p-1.5 text-mute hover:text-accent"
                  title="Listeden çıkar"
                  onClick={() => onPatch(r.rid, { include: false })}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReviewShell>
  );
}

function MediaReviewStep({
  rows,
  type,
  onPatch,
  onApplyAll,
}: {
  rows: MediaRow[];
  type: MediaType;
  onPatch: (rid: string, patch: Partial<MediaRow>) => void;
  onApplyAll: (status: MediaStatus) => void;
}) {
  const multiSource = new Set(rows.map((r) => r.source)).size > 1;
  return (
    <ReviewShell
      selectedCount={rows.filter((r) => r.include && r.title.trim()).length}
      warning="Yapay zekâ yanılabilir — başlık, yönetmen ve yılı kontrol et, gerekirse düzelt. İşaretli olanlar eklenecek."
      quickStatus={MEDIA_STATUSES.map((s, index) => (
        <button
          key={s.value}
          className={`px-3 py-1.5 text-sm hover:bg-hover ${index > 0 ? "border-l border-line" : ""}`}
          onClick={() => onApplyAll(s.value)}
        >
          {s.label}
        </button>
      ))}
    >
      <table className="w-full text-sm">
        <thead className="bg-hover text-xs uppercase text-mute">
          <tr>
            <th className="px-2 py-2 w-8"></th>
            <th className="px-3 py-2 text-left">Başlık</th>
            <th className="px-3 py-2 text-left">Yönetmen</th>
            <th className="px-3 py-2 text-left w-24">Yıl</th>
            <th className="px-3 py-2 text-left w-40">Liste</th>
            <th className="px-2 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.rid}
              className={`border-t border-line ${r.include ? "" : "opacity-50"}`}
            >
              <td className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  aria-label={`${r.title} kaydını ekle`}
                  className="row-check accent-[var(--accent)] w-4 h-4"
                  checked={r.include}
                  onChange={(e) =>
                    onPatch(r.rid, { include: e.target.checked })
                  }
                />
              </td>
              <td className="px-3 py-2">
                <input
                  className="input py-1"
                  aria-label="Başlık"
                  value={r.title}
                  onChange={(e) => onPatch(r.rid, { title: e.target.value })}
                />
                <div className="mt-1 flex items-center gap-2">
                  {r.duplicate && <span className="chip">listede var</span>}
                  {r.genre && (
                    <span className="text-[11px] text-mute">{r.genre}</span>
                  )}
                  {type === "film" && r.duration && (
                    <span className="text-[11px] text-mute">
                      {r.duration} dk
                    </span>
                  )}
                  {type === "dizi" && r.seasons && (
                    <span className="text-[11px] text-mute">
                      {r.seasons} sezon
                    </span>
                  )}
                  {multiSource && r.source && (
                    <span className="text-[11px] text-mute truncate max-w-[10rem]">
                      {r.source}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <input
                  className="input py-1"
                  aria-label="Yönetmen"
                  value={r.director ?? ""}
                  placeholder="—"
                  onChange={(e) => onPatch(r.rid, { director: e.target.value })}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  className="input py-1"
                  aria-label="Çıkış yılı"
                  type="number"
                  value={r.releaseYear ?? ""}
                  onChange={(e) =>
                    onPatch(r.rid, {
                      releaseYear: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </td>
              <td className="px-3 py-2">
                <select
                  className="input py-1"
                  aria-label="Liste"
                  value={r.status}
                  onChange={(e) =>
                    onPatch(r.rid, { status: e.target.value as MediaStatus })
                  }
                >
                  {MEDIA_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  className="btn btn-ghost p-1.5 text-mute hover:text-accent"
                  title="Listeden çıkar"
                  onClick={() => onPatch(r.rid, { include: false })}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReviewShell>
  );
}
