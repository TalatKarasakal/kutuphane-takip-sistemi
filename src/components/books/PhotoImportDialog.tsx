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
import {
  detectBooksFromImage,
  hasGeminiSecret,
  type DetectedBook,
} from "../../lib/ai/detectBooks";
import { duplicateKey } from "../../lib/filters";
import { STATUSES } from "../../constants/statuses";
import type { Book, BookStatus } from "../../types/book";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

type Step = "pick" | "detecting" | "review";

interface ReviewRow extends DetectedBook {
  rid: string;
  include: boolean;
  status: BookStatus;
  duplicate: boolean;
}

const detectedDuplicateKey = (b: Pick<Book, "title" | "author" | "isbn">) =>
  duplicateKey({
    id: "",
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    status: "okunacak",
    addedAt: "",
    updatedAt: "",
  });

export function PhotoImportDialog({ open, onClose, onOpenSettings }: Props) {
  const { addMany, books } = useBooks();
  const [hasKey, setHasKey] = useState(false);

  const [step, setStep] = useState<Step>("pick");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) void hasGeminiSecret().then(setHasKey);
  }, [open]);

  const reset = () => {
    setStep("pick");
    setFileName("");
    setError("");
    setNotice("");
    setRows([]);
    setSaving(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const existing = () => {
    const set = new Set<string>();
    books.forEach((b) => {
      const key = duplicateKey(b);
      if (key) set.add(key);
    });
    return set;
  };

  const onFile = async (file: File) => {
    setError("");
    setNotice("");
    setFileName(file.name);
    setStep("detecting");
    const res = await detectBooksFromImage(file);
    if (!res.ok) {
      setError(res.error);
      setStep("pick");
      return;
    }
    if (res.books.length === 0) {
      setNotice(
        "Bu fotoğrafta kitap algılanamadı. Sırtların/kapakların daha net göründüğü bir fotoğrafla tekrar dene.",
      );
      setStep("pick");
      return;
    }
    const seen = existing();
    setRows(
      res.books.map((b, i) => {
        const key = detectedDuplicateKey(b);
        const duplicate = key != null && seen.has(key);
        return {
          ...b,
          rid: `${i}-${b.title}`,
          include: !duplicate,
          status: "okunacak" as BookStatus,
          duplicate,
        };
      }),
    );
    setStep("review");
  };

  const patchRow = (rid: string, patch: Partial<ReviewRow>) =>
    setRows((rs) => rs.map((r) => (r.rid === rid ? { ...r, ...patch } : r)));

  const applyStatusToAll = (status: BookStatus) =>
    setRows((rs) => rs.map((r) => ({ ...r, status })));

  const includedCount = rows.filter((r) => r.include && r.title.trim()).length;

  const doAdd = async () => {
    if (saving) return;
    const toAdd: Omit<Book, "id" | "addedAt" | "updatedAt">[] = rows
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
    if (toAdd.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await addMany(toAdd);
      close();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Kitaplar eklenemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title={
        "Fotoğraftan Ekle" +
        (fileName && step !== "pick" ? ` · ${fileName}` : "")
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
              ) : includedCount > 0 ? (
                `${includedCount} Kitabı Ekle`
              ) : (
                "Ekle"
              )}
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={close}>
            Kapat
          </button>
        )
      }
    >
      {error && step === "review" && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
      {step === "pick" && (
        <PickStep
          hasKey={hasKey}
          error={error}
          notice={notice}
          onFile={onFile}
          onOpenSettings={() => {
            onClose();
            onOpenSettings();
          }}
        />
      )}
      {step === "detecting" && <DetectingStep />}
      {step === "review" && (
        <ReviewStep
          rows={rows}
          onPatch={patchRow}
          onApplyAll={applyStatusToAll}
        />
      )}
    </Modal>
  );
}

function PickStep({
  hasKey,
  error,
  notice,
  onFile,
  onOpenSettings,
}: {
  hasKey: boolean;
  error: string;
  notice: string;
  onFile: (f: File) => void;
  onOpenSettings: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  if (!hasKey) {
    return (
      <div className="py-8 text-center">
        <Sparkles size={28} className="mx-auto mb-3 text-primary" />
        <div className="font-medium mb-1">
          Önce ücretsiz Gemini anahtarını ekle
        </div>
        <div className="text-sm text-muted max-w-md mx-auto mb-4">
          Bu özellik fotoğraftaki kitapları tanımak için Google'ın ücretsiz
          Gemini servisini kullanır. Google AI Studio'dan kredi kartı gerekmeden
          ücretsiz bir anahtar alıp Ayarlar'a yapıştırman yeterli.
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
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 text-rose-500 shrink-0" />
          <div className="text-rose-800 dark:text-rose-200">{error}</div>
        </div>
      )}
      {notice && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 text-amber-500 shrink-0" />
          <div className="text-amber-800 dark:text-amber-200">{notice}</div>
        </div>
      )}
      <label
        className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-primary bg-primary/10" : "border-border hover:bg-surface2"}`}
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
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <ImagePlus size={28} className="mx-auto mb-3 text-primary" />
        <div className="font-medium mb-1">
          Kitap fotoğrafı seç ya da buraya sürükle-bırak
        </div>
        <div className="text-sm text-muted mb-4">
          .jpg · .png · .webp — raftaki sırtların/kapakların net göründüğü bir
          fotoğraf en iyi sonucu verir
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <span className="btn btn-primary">
          <Upload size={15} /> Fotoğraf Seç
        </span>
      </label>
      <div className="text-xs text-muted mt-3 flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Yapay zekâ kitapları tanır, künyeyi (yayınevi, sayfa, kapak) Google
          Books'tan tamamlar; eklemeden önce listeyi gözden geçirip onaylarsın.
        </span>
      </div>
    </div>
  );
}

function DetectingStep() {
  return (
    <div className="py-16 text-center">
      <Loader2 size={32} className="mx-auto mb-4 text-primary animate-spin" />
      <div className="font-medium mb-1">Fotoğraf inceleniyor…</div>
      <div className="text-sm text-muted">
        Kitaplar tanınıyor ve künyeleri tamamlanıyor. Bu birkaç saniye
        sürebilir.
      </div>
    </div>
  );
}

function ReviewStep({
  rows,
  onPatch,
  onApplyAll,
}: {
  rows: ReviewRow[];
  onPatch: (rid: string, patch: Partial<ReviewRow>) => void;
  onApplyAll: (status: BookStatus) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Tümünü şu listeye al:</span>
          <div className="inline-flex border border-border rounded-lg bg-surface overflow-hidden">
            <button
              className="px-3 py-1.5 text-sm hover:bg-surface2"
              onClick={() => onApplyAll("okunacak")}
            >
              Okunacak
            </button>
            <button
              className="px-3 py-1.5 text-sm hover:bg-surface2 border-l border-border"
              onClick={() => onApplyAll("satin-alinacak")}
            >
              Satın Alınacak
            </button>
          </div>
        </div>
        <div className="chip bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={12} />{" "}
          {rows.filter((r) => r.include && r.title.trim()).length} seçili
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase text-muted">
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
                className={`border-t border-border ${r.include ? "" : "opacity-50"}`}
              >
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    className="accent-[rgb(var(--primary))] w-4 h-4"
                    checked={r.include}
                    onChange={(e) =>
                      onPatch(r.rid, { include: e.target.checked })
                    }
                  />
                </td>
                <td className="px-2 py-2">
                  <div
                    className="grid h-11 w-8 place-items-center rounded border border-border bg-surface2 text-[9px] text-muted"
                    title={r.coverUrl ? "Kapak bağlantısı bulundu" : undefined}
                  >
                    {r.coverUrl ? "Kapak" : "—"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input py-1"
                    value={r.title}
                    onChange={(e) => onPatch(r.rid, { title: e.target.value })}
                  />
                  <div className="mt-1 flex items-center gap-2">
                    {r.duplicate && (
                      <span className="chip bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                        listede var
                      </span>
                    )}
                    {!r.matched && (
                      <span className="text-[11px] text-muted">
                        künye bulunamadı
                      </span>
                    )}
                    {r.publicationYear && (
                      <span className="text-[11px] text-muted">
                        {r.publicationYear}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input py-1"
                    value={r.author}
                    placeholder="—"
                    onChange={(e) => onPatch(r.rid, { author: e.target.value })}
                  />
                  {r.publisher && (
                    <div className="text-[11px] text-muted mt-1 truncate">
                      {r.publisher}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <select
                    className="input py-1"
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
                    className="btn btn-ghost p-1.5 text-muted hover:text-rose-500"
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
      </div>

      <div className="text-xs text-muted flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
        <span>
          Yapay zekâ yanılabilir — başlık/yazarı kontrol et, gerekirse düzelt.
          İşaretli olanlar eklenecek.
        </span>
      </div>
    </div>
  );
}
