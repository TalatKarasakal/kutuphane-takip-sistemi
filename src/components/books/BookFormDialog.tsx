import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Loader2, Star } from "lucide-react";
import { Modal } from "../ui/Modal";
import { STATUSES } from "../../constants/statuses";
import { GENRES } from "../../constants/genres";
import { useBooks } from "../../store/booksStore";
import { smartTitleCase } from "../../lib/utils";
import {
  normalizeBookDraft,
  ValidationError,
  type BookDraft,
} from "../../lib/validation";
import { TagPicker } from "../tags/TagPicker";
import { IsbnLookup } from "./IsbnLookup";
import type { Book, BookStatus, Rating } from "../../types/book";
import type { DetectedBook } from "../../lib/ai/detectBooks";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (book: BookDraft) => Promise<void>;
  initial?: Book;
}

const EMPTY: BookDraft = {
  title: "",
  author: "",
  publisher: "",
  pageCount: undefined,
  genre: "",
  isbn: "",
  publicationYear: undefined,
  language: "",
  translator: "",
  status: "mevcut",
  rating: undefined,
  notes: "",
  tagIds: [],
  coverUrl: undefined,
  readStartDate: "",
  readEndDate: "",
};

function toForm(initial?: Book): BookDraft {
  if (!initial) return { ...EMPTY };
  const {
    id: _id,
    addedAt: _addedAt,
    updatedAt: _updatedAt,
    ...draft
  } = initial;
  return { ...EMPTY, ...draft, tagIds: [...(draft.tagIds ?? [])] };
}

export function BookFormDialog({ open, onClose, onSave, initial }: Props) {
  const { books } = useBooks();
  const [form, setForm] = useState<BookDraft>(() => toForm(initial));
  const [errors, setErrors] = useState<
    Partial<Record<keyof BookDraft, string>>
  >({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);
  const baseline = useRef(JSON.stringify(toForm(initial)));
  const formRef = useRef<HTMLFormElement>(null);

  const authors = useMemo(
    () =>
      [...new Set(books.map((book) => book.author).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "tr"),
      ),
    [books],
  );
  const publishers = useMemo(
    () =>
      [
        ...new Set(
          books.map((book) => book.publisher).filter(Boolean) as string[],
        ),
      ].sort((a, b) => a.localeCompare(b, "tr")),
    [books],
  );

  useEffect(() => {
    if (!open) return;
    const next = toForm(initial);
    setForm(next);
    baseline.current = JSON.stringify(next);
    setErrors({});
    setGeneralError("");
    setSaving(false);
  }, [initial, open]);

  const dirty = JSON.stringify(form) !== baseline.current;
  const close = () => {
    if (saving) return;
    if (dirty && !window.confirm("Kaydedilmemiş değişiklikler silinsin mi?"))
      return;
    onClose();
  };
  const update = <K extends keyof BookDraft>(key: K, value: BookDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateTitle = (
    key: "title" | "author" | "publisher",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: smartTitleCase(String(current[key] ?? ""), value),
    }));
  };

  const applyMetadata = (book: DetectedBook) =>
    setForm((current) => ({
      ...current,
      title: book.title || current.title,
      author: book.author || current.author,
      publisher: book.publisher ?? current.publisher,
      pageCount: book.pageCount ?? current.pageCount,
      publicationYear: book.publicationYear ?? current.publicationYear,
      isbn: book.isbn ?? current.isbn,
      genre: book.genre ?? current.genre,
      language: book.language ?? current.language,
      coverUrl: book.coverUrl ?? current.coverUrl,
    }));

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setErrors({});
    setGeneralError("");
    let normalized: BookDraft;
    try {
      normalized = normalizeBookDraft(form);
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(
          Object.fromEntries(
            error.issues.map((issue) => [issue.field, issue.message]),
          ) as Partial<Record<keyof BookDraft, string>>,
        );
        setGeneralError(error.issues[0]?.message ?? error.message);
        const firstField = error.issues[0]?.field;
        requestAnimationFrame(() =>
          formRef.current
            ?.querySelector<HTMLElement>(`[name="${firstField}"]`)
            ?.focus(),
        );
      } else
        setGeneralError(
          error instanceof Error ? error.message : "Form doğrulanamadı.",
        );
      return;
    }
    setSaving(true);
    try {
      await onSave(normalized);
      baseline.current = JSON.stringify(normalized);
      onClose();
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Kitap kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={initial ? "Kitabı Düzenle" : "Yeni Kitap"}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={close}
            disabled={saving}
          >
            Vazgeç
          </button>
          <button
            type="submit"
            form="book-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {initial ? "Kaydet" : "Ekle"}
          </button>
        </>
      }
    >
      <form
        ref={formRef}
        id="book-form"
        onSubmit={submit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        noValidate
      >
        {generalError && (
          <div
            role="alert"
            className="sm:col-span-2 rounded-lg bg-accent-soft border border-accent/30 px-3 py-2 text-sm text-accent"
          >
            {generalError}
          </div>
        )}
        <Field label="Başlık *" error={errors.title} errorId="book-title-error">
          <input
            name="title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "book-title-error" : undefined}
            className="input"
            maxLength={300}
            value={form.title}
            onChange={(event) => updateTitle("title", event.target.value)}
            autoFocus
            data-initial-focus
          />
        </Field>
        <Field label="Yazar" error={errors.author} errorId="book-author-error">
          <input
            name="author"
            list="author-list"
            aria-invalid={!!errors.author}
            aria-describedby={errors.author ? "book-author-error" : undefined}
            className="input"
            maxLength={200}
            value={form.author}
            placeholder="Boşsa Bilinmiyor olur"
            onChange={(event) => updateTitle("author", event.target.value)}
          />
          <datalist id="author-list">
            {authors.map((author) => (
              <option key={author} value={author} />
            ))}
          </datalist>
        </Field>
        <Field label="Yayınevi" error={errors.publisher}>
          <input
            name="publisher"
            aria-invalid={!!errors.publisher}
            list="publisher-list"
            className="input"
            maxLength={160}
            value={form.publisher ?? ""}
            onChange={(event) => updateTitle("publisher", event.target.value)}
          />
          <datalist id="publisher-list">
            {publishers.map((publisher) => (
              <option key={publisher} value={publisher} />
            ))}
          </datalist>
        </Field>
        <Field label="Tür" error={errors.genre}>
          <input
            name="genre"
            aria-invalid={!!errors.genre}
            list="genre-list"
            className="input"
            maxLength={160}
            value={form.genre ?? ""}
            onChange={(event) => update("genre", event.target.value)}
          />
          <datalist id="genre-list">
            {GENRES.map((genre) => (
              <option key={genre} value={genre} />
            ))}
          </datalist>
        </Field>
        <Field label="Sayfa Sayısı" error={errors.pageCount}>
          <input
            name="pageCount"
            aria-invalid={!!errors.pageCount}
            type="number"
            min={1}
            max={100000}
            className="input"
            value={form.pageCount ?? ""}
            onChange={(event) =>
              update(
                "pageCount",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Yayın Yılı" error={errors.publicationYear}>
          <input
            name="publicationYear"
            aria-invalid={!!errors.publicationYear}
            type="number"
            min={1000}
            max={new Date().getFullYear() + 2}
            className="input"
            value={form.publicationYear ?? ""}
            onChange={(event) =>
              update(
                "publicationYear",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="ISBN" error={errors.isbn}>
          <input
            name="isbn"
            aria-invalid={!!errors.isbn}
            className="input"
            maxLength={20}
            value={form.isbn ?? ""}
            onChange={(event) => update("isbn", event.target.value)}
          />
        </Field>
        <Field label="Dil" error={errors.language}>
          <input
            name="language"
            aria-invalid={!!errors.language}
            className="input"
            maxLength={160}
            value={form.language ?? ""}
            onChange={(event) => update("language", event.target.value)}
          />
        </Field>
        <IsbnLookup
          isbn={form.isbn}
          onIsbn={(isbn) => update("isbn", isbn)}
          onApply={applyMetadata}
        />
        <Field label="Çevirmen" error={errors.translator}>
          <input
            name="translator"
            aria-invalid={!!errors.translator}
            className="input"
            maxLength={200}
            value={form.translator ?? ""}
            onChange={(event) => update("translator", event.target.value)}
          />
        </Field>
        <Field label="Durum">
          <select
            className="input"
            value={form.status}
            onChange={(event) =>
              update("status", event.target.value as BookStatus)
            }
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Puan">
          <div className="h-9 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                type="button"
                key={rating}
                aria-label={`${rating} yıldız`}
                aria-pressed={form.rating === rating}
                onClick={() =>
                  update(
                    "rating",
                    form.rating === rating ? undefined : (rating as Rating),
                  )
                }
              >
                <Star
                  size={20}
                  className={
                    rating <= (form.rating ?? 0)
                      ? "fill-accent text-accent"
                      : "text-mute"
                  }
                />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Okumaya Başlama" error={errors.readStartDate}>
          <input
            name="readStartDate"
            aria-invalid={!!errors.readStartDate}
            type="date"
            className="input"
            value={form.readStartDate ?? ""}
            onChange={(event) => update("readStartDate", event.target.value)}
          />
        </Field>
        <Field label="Okumayı Bitirme" error={errors.readEndDate}>
          <input
            name="readEndDate"
            aria-invalid={!!errors.readEndDate}
            type="date"
            min={form.readStartDate || undefined}
            className="input"
            value={form.readEndDate ?? ""}
            onChange={(event) => update("readEndDate", event.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Etiketler">
            <TagPicker
              value={form.tagIds}
              onChange={(ids) => update("tagIds", ids)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Notlar" error={errors.notes}>
            <textarea
              name="notes"
              aria-invalid={!!errors.notes}
              maxLength={10000}
              className="input min-h-[88px]"
              value={form.notes ?? ""}
              onChange={(event) => update("notes", event.target.value)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  errorId,
  children,
}: {
  label: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  const generatedErrorId = useId();
  const resolvedErrorId = errorId ?? generatedErrorId;
  const describedChild =
    error && isValidElement(children)
      ? cloneElement(
          children as ReactElement<{ "aria-describedby"?: string }>,
          {
            "aria-describedby": [
              ...new Set(
                [
                  (children.props as { "aria-describedby"?: string })[
                    "aria-describedby"
                  ],
                  resolvedErrorId,
                ].filter(Boolean),
              ),
            ].join(" "),
          },
        )
      : children;
  return (
    <div className="block">
      <label className="block">
        <span className="label">{label}</span>
        {describedChild}
      </label>
      {error && (
        <span id={resolvedErrorId} className="text-xs text-accent mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
}
