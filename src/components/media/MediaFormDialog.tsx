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
import { Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { MEDIA_STATUSES } from "../../constants/mediaStatuses";
import { MEDIA_GENRES } from "../../constants/genres";
import { useMedia } from "../../store/mediaStore";
import { smartTitleCase } from "../../lib/utils";
import {
  normalizeMediaDraft,
  ValidationError,
  type MediaDraft,
} from "../../lib/validation";
import { TagPicker } from "../tags/TagPicker";
import type { Media, MediaStatus, MediaType } from "../../types/media";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (media: MediaDraft) => Promise<void>;
  initial?: Media;
  type: MediaType;
}

function empty(type: MediaType): MediaDraft {
  return {
    title: "",
    type,
    director: "",
    genre: "",
    releaseYear: undefined,
    watchYear: undefined,
    duration: undefined,
    seasons: undefined,
    episodeDuration: undefined,
    status: "izlenecek",
    notes: "",
    tagIds: [],
    posterUrl: "",
  };
}

function toForm(type: MediaType, initial?: Media): MediaDraft {
  if (!initial) return empty(type);
  const {
    id: _id,
    addedAt: _addedAt,
    updatedAt: _updatedAt,
    ...draft
  } = initial;
  return { ...empty(type), ...draft, type, tagIds: [...(draft.tagIds ?? [])] };
}

export function MediaFormDialog({
  open,
  onClose,
  onSave,
  initial,
  type,
}: Props) {
  const { media } = useMedia();
  const [form, setForm] = useState<MediaDraft>(() => toForm(type, initial));
  const [errors, setErrors] = useState<
    Partial<Record<keyof MediaDraft, string>>
  >({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);
  const baseline = useRef(JSON.stringify(toForm(type, initial)));
  const formRef = useRef<HTMLFormElement>(null);

  const genres = useMemo(() => {
    const fromData = media
      .map((item) => item.genre)
      .filter(Boolean) as string[];
    return [...new Set([...MEDIA_GENRES, ...fromData])].sort((a, b) =>
      a.localeCompare(b, "tr"),
    );
  }, [media]);

  useEffect(() => {
    if (!open) return;
    const next = toForm(type, initial);
    setForm(next);
    baseline.current = JSON.stringify(next);
    setErrors({});
    setGeneralError("");
    setSaving(false);
  }, [initial, open, type]);

  const dirty = JSON.stringify(form) !== baseline.current;
  const close = () => {
    if (saving) return;
    if (dirty && !window.confirm("Kaydedilmemiş değişiklikler silinsin mi?"))
      return;
    onClose();
  };
  const update = <K extends keyof MediaDraft>(key: K, value: MediaDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setErrors({});
    setGeneralError("");
    let normalized: MediaDraft;
    try {
      normalized = normalizeMediaDraft(form);
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(
          Object.fromEntries(
            error.issues.map((issue) => [issue.field, issue.message]),
          ) as Partial<Record<keyof MediaDraft, string>>,
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
        error instanceof Error ? error.message : "Kayıt kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const label = type === "film" ? "Film" : "Dizi";
  const currentYear = new Date().getFullYear();
  return (
    <Modal
      open={open}
      onClose={close}
      title={initial ? `${label}i Düzenle` : `Yeni ${label}`}
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
            form="media-form"
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
        id="media-form"
        onSubmit={submit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        noValidate
      >
        {generalError && (
          <div
            role="alert"
            className="sm:col-span-2 rounded-lg bg-secondary/10 border border-secondary/30 px-3 py-2 text-sm text-secondary"
          >
            {generalError}
          </div>
        )}
        <div className="sm:col-span-2">
          <Field
            label="Başlık *"
            error={errors.title}
            errorId="media-title-error"
          >
            <input
              name="title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "media-title-error" : undefined}
              className="input"
              maxLength={300}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: smartTitleCase(current.title, event.target.value),
                }))
              }
              autoFocus
              data-initial-focus
            />
          </Field>
        </div>
        <Field label="Yönetmen" error={errors.director}>
          <input
            name="director"
            aria-invalid={!!errors.director}
            className="input"
            maxLength={200}
            value={form.director ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                director: smartTitleCase(
                  current.director ?? "",
                  event.target.value,
                ),
              }))
            }
          />
        </Field>
        <Field label="Tür" error={errors.genre}>
          <input
            name="genre"
            aria-invalid={!!errors.genre}
            list="media-genre-list"
            className="input"
            maxLength={160}
            value={form.genre ?? ""}
            onChange={(event) => update("genre", event.target.value)}
          />
          <datalist id="media-genre-list">
            {genres.map((genre) => (
              <option key={genre} value={genre} />
            ))}
          </datalist>
        </Field>
        <Field label="Durum">
          <select
            className="input"
            value={form.status}
            onChange={(event) =>
              update("status", event.target.value as MediaStatus)
            }
          >
            {MEDIA_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Çıkış Yılı" error={errors.releaseYear}>
          <input
            name="releaseYear"
            aria-invalid={!!errors.releaseYear}
            type="number"
            min={1888}
            max={currentYear + 2}
            className="input"
            value={form.releaseYear ?? ""}
            onChange={(event) =>
              update(
                "releaseYear",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="İzlenme Yılı" error={errors.watchYear}>
          <input
            name="watchYear"
            aria-invalid={!!errors.watchYear}
            type="number"
            min={1888}
            max={currentYear + 1}
            className="input"
            value={form.watchYear ?? ""}
            onChange={(event) =>
              update(
                "watchYear",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </Field>
        {type === "film" ? (
          <Field label="Süre (dakika)" error={errors.duration}>
            <input
              name="duration"
              aria-invalid={!!errors.duration}
              type="number"
              min={1}
              max={2000}
              className="input"
              value={form.duration ?? ""}
              onChange={(event) =>
                update(
                  "duration",
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
            />
          </Field>
        ) : (
          <>
            <Field label="Sezon Sayısı" error={errors.seasons}>
              <input
                name="seasons"
                aria-invalid={!!errors.seasons}
                type="number"
                min={1}
                max={10000}
                className="input"
                value={form.seasons ?? ""}
                onChange={(event) =>
                  update(
                    "seasons",
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
              />
            </Field>
            <Field label="Ortalama Bölüm Süresi" error={errors.episodeDuration}>
              <input
                name="episodeDuration"
                aria-invalid={!!errors.episodeDuration}
                type="number"
                min={1}
                max={1000}
                className="input"
                value={form.episodeDuration ?? ""}
                onChange={(event) =>
                  update(
                    "episodeDuration",
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
              />
            </Field>
          </>
        )}
        <div className="sm:col-span-2">
          <Field label="Poster HTTPS URL" error={errors.posterUrl}>
            <input
              name="posterUrl"
              aria-invalid={!!errors.posterUrl}
              type="url"
              className="input"
              maxLength={2048}
              placeholder="https://…"
              value={form.posterUrl ?? ""}
              onChange={(event) => update("posterUrl", event.target.value)}
            />
          </Field>
        </div>
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
              className="input min-h-[88px]"
              maxLength={10000}
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
        <span
          id={resolvedErrorId}
          className="text-xs text-secondary mt-1 block"
        >
          {error}
        </span>
      )}
    </div>
  );
}
