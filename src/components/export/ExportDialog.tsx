import { useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import {
  EXPORT_FIELDS,
  exportCsv,
  exportJson,
  exportXlsx,
} from "../../lib/exporters";
import {
  MEDIA_EXPORT_FIELDS,
  exportMediaCsv,
  exportMediaJson,
  exportMediaXlsx,
} from "../../lib/exporters";
import { useBooks } from "../../store/booksStore";
import { useMedia } from "../../store/mediaStore";
import { applyFilters } from "../../lib/filters";
import { applyMediaFilters } from "../../store/mediaStore";
import type { Book } from "../../types/book";
import type { Media } from "../../types/media";
import type { Section } from "../layout/AppShell";
import { useTags } from "../../store/tagsStore";
import { useLoans } from "../../store/loansStore";

type Format = "xlsx" | "csv" | "json";
type Scope = "all" | "filtered" | "selected";

interface Props {
  open: boolean;
  onClose: () => void;
  section: Section;
}

export function ExportDialog({ open, onClose, section }: Props) {
  const books = useBooks();
  const media = useMedia();
  const tags = useTags((state) => state.tags);
  const loans = useLoans((state) => state.loans);
  const isMedia = section !== "books";
  const mediaType =
    section === "movies" ? ("film" as const) : ("dizi" as const);

  const [format, setFormat] = useState<Format>("xlsx");
  const [scope, setScope] = useState<Scope>("all");
  const [bookFields, setBookFields] = useState<(keyof Book)[]>(
    EXPORT_FIELDS.map((f) => f.key),
  );
  const [mediaFields, setMediaFields] = useState<(keyof Media)[]>(
    MEDIA_EXPORT_FIELDS.map((f) => f.key),
  );
  const [busy, setBusy] = useState(false);
  const tagNames = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag.name])),
    [tags],
  );
  const loanIds = useMemo(
    () => new Set(loans.map((loan) => loan.bookId)),
    [loans],
  );

  const filteredBooks = useMemo(
    () =>
      applyFilters(books.books, {
        search: books.search,
        statusFilter: books.statusFilter,
        genreFilter: books.genreFilter,
        tagFilter: books.tagFilter,
        tagFilterMode: books.tagFilterMode,
        duplicatesOnly: books.duplicatesOnly,
        loansOnly: books.loansOnly,
        loanIds,
        sortKey: books.sortKey,
        sortDir: books.sortDir,
      }),
    [
      books.books,
      books.search,
      books.statusFilter,
      books.genreFilter,
      books.tagFilter,
      books.tagFilterMode,
      books.duplicatesOnly,
      books.loansOnly,
      books.sortKey,
      books.sortDir,
      loanIds,
    ],
  );

  const filteredMedia = useMemo(
    () => applyMediaFilters(media.media, mediaType, media.filters[mediaType]),
    [media.filters, media.media, mediaType],
  );

  const allMedia = useMemo(
    () => media.media.filter((m) => m.type === mediaType),
    [media.media, mediaType],
  );

  const doExport = async () => {
    if (busy) return;
    setBusy(true);
    const ts = new Date().toISOString().slice(0, 10);
    try {
      if (isMedia) {
        const target: Media[] =
          scope === "all"
            ? allMedia
            : scope === "filtered"
              ? filteredMedia
              : allMedia.filter((m) => media.selectedIds.has(m.id));
        const fn = `kutuphanem-${mediaType}-${ts}.${format}`;
        if (format === "xlsx")
          await exportMediaXlsx(target, mediaFields, fn, tagNames);
        else if (format === "csv")
          exportMediaCsv(target, mediaFields, fn, tagNames);
        else exportMediaJson(target, mediaFields, fn);
      } else {
        const target: Book[] =
          scope === "all"
            ? books.books
            : scope === "filtered"
              ? filteredBooks
              : books.books.filter((b) => books.selectedIds.has(b.id));
        const fn = `kutuphanem-${ts}.${format}`;
        if (format === "xlsx")
          await exportXlsx(target, bookFields, fn, tagNames);
        else if (format === "csv") exportCsv(target, bookFields, fn, tagNames);
        else exportJson(target, bookFields, fn);
      }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const totalCount = isMedia ? allMedia.length : books.books.length;
  const filteredCount = isMedia ? filteredMedia.length : filteredBooks.length;
  const selectedCount = isMedia
    ? media.selectedIds.size
    : books.selectedIds.size;

  const targetCount =
    scope === "all"
      ? totalCount
      : scope === "filtered"
        ? filteredCount
        : selectedCount;
  const currentFields = isMedia ? mediaFields : bookFields;
  const exportFields = isMedia ? MEDIA_EXPORT_FIELDS : EXPORT_FIELDS;

  const toggleField = (k: string) => {
    if (isMedia) {
      const key = k as keyof Media;
      setMediaFields((cur) =>
        cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key],
      );
    } else {
      const key = k as keyof Book;
      setBookFields((cur) =>
        cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key],
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dışa Aktar"
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void doExport()}
            disabled={busy || targetCount === 0 || currentFields.length === 0}
          >
            {busy ? "Hazırlanıyor…" : `Dışa Aktar (${targetCount})`}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="label">Biçim</div>
          <div className="flex gap-2">
            {(["xlsx", "csv", "json"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`btn ${format === f ? "btn-primary" : "btn-outline"}`}
              >
                .{f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Kapsam</div>
          <div className="flex gap-2 flex-wrap">
            <ScopeBtn active={scope === "all"} onClick={() => setScope("all")}>
              Tümü ({totalCount})
            </ScopeBtn>
            <ScopeBtn
              active={scope === "filtered"}
              onClick={() => setScope("filtered")}
            >
              Filtreli ({filteredCount})
            </ScopeBtn>
            <ScopeBtn
              active={scope === "selected"}
              onClick={() => setScope("selected")}
              disabled={selectedCount === 0}
            >
              Seçili ({selectedCount})
            </ScopeBtn>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="label m-0">Alanlar</div>
            <div className="flex gap-2 text-xs">
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  if (isMedia)
                    setMediaFields(MEDIA_EXPORT_FIELDS.map((f) => f.key));
                  else setBookFields(EXPORT_FIELDS.map((f) => f.key));
                }}
              >
                Tümü
              </button>
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  if (isMedia) setMediaFields([]);
                  else setBookFields([]);
                }}
              >
                Hiçbiri
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {exportFields.map((f) => (
              <label
                key={f.key}
                className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface2"
              >
                <input
                  type="checkbox"
                  checked={currentFields.includes(f.key as never)}
                  onChange={() => toggleField(f.key)}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ScopeBtn({
  active,
  children,
  ...rest
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`btn ${active ? "btn-primary" : "btn-outline"}`}
      {...rest}
    >
      {children}
    </button>
  );
}
