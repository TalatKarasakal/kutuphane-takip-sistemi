import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { duplicateKey } from "../../lib/filters";
import { useBooks } from "../../store/booksStore";
import type { Book } from "../../types/book";
import type { BookDraft } from "../../lib/validation";
import { mergeBookDraft } from "../../lib/duplicates";

const FIELDS = [
  ["title", "Başlık"],
  ["author", "Yazar"],
  ["publisher", "Yayınevi"],
  ["isbn", "ISBN"],
  ["genre", "Tür"],
  ["publicationYear", "Yayın yılı"],
  ["pageCount", "Sayfa"],
  ["language", "Dil"],
  ["translator", "Çevirmen"],
  ["status", "Durum"],
  ["rating", "Puan"],
  ["coverUrl", "Kapak URL"],
  ["notes", "Notlar"],
] as const;

type MergeField = (typeof FIELDS)[number][0];

function valueLabel(value: Book[MergeField]) {
  if (value == null || value === "") return "— boş —";
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

export function DuplicateMergeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const books = useBooks((state) => state.books);
  const mergeDuplicates = useBooks((state) => state.mergeDuplicates);
  const groups = useMemo(() => {
    const map = new Map<string, Book[]>();
    books.forEach((book) => {
      const key = duplicateKey(book);
      if (!key) return;
      map.set(key, [...(map.get(key) ?? []), book]);
    });
    return [...map.entries()].filter(([, items]) => items.length > 1);
  }, [books]);
  const [groupKey, setGroupKey] = useState("");
  const [targetId, setTargetId] = useState("");
  const [fieldSources, setFieldSources] = useState<
    Partial<Record<MergeField, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const group = useMemo(
    () => groups.find(([key]) => key === groupKey)?.[1] ?? groups[0]?.[1] ?? [],
    [groupKey, groups],
  );

  useEffect(() => {
    if (!open) return;
    const firstKey = groups[0]?.[0] ?? "";
    setGroupKey(firstKey);
  }, [groups, open]);

  useEffect(() => {
    const oldest = [...group].sort((a, b) =>
      a.addedAt.localeCompare(b.addedAt),
    )[0];
    setTargetId(oldest?.id ?? "");
    setFieldSources(
      Object.fromEntries(FIELDS.map(([field]) => [field, oldest?.id ?? ""])),
    );
  }, [group]);

  const merge = async () => {
    const target = group.find((book) => book.id === targetId);
    if (!target) return;
    const selected: Partial<BookDraft> = {};
    for (const [field] of FIELDS) {
      const source = group.find((book) => book.id === fieldSources[field]);
      if (source) (selected as Record<string, unknown>)[field] = source[field];
    }
    const sources = group.filter((book) => book.id !== target.id);
    const draft = mergeBookDraft(target, sources, selected);
    setSaving(true);
    try {
      await mergeDuplicates(
        target.id,
        sources.map((book) => book.id),
        draft,
      );
      if (groups.length <= 1) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mükerrer Kayıtları Birleştir"
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Kapat
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void merge()}
            disabled={saving || !targetId}
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Seçili
            Grubu Birleştir
          </button>
        </>
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-mute">
          Birleştirilecek mükerrer kayıt kalmadı.
        </p>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="label">Mükerrer grup</span>
            <select
              className="input"
              value={groupKey || groups[0][0]}
              onChange={(event) => setGroupKey(event.target.value)}
            >
              {groups.map(([key, items]) => (
                <option key={key} value={key}>
                  {items[0].title} · {items.length} kayıt
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Korunacak ana kayıt</span>
            <select
              className="input"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              {group.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ·{" "}
                  {new Date(book.addedAt).toLocaleString("tr-TR")}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-mute">
            Her alan için korunacak değeri seç. Etiketler otomatik olarak
            birleştirilir; diğer kayıtlar atomik olarak silinir.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map(([field, label]) => (
              <label key={field} className="block">
                <span className="label">{label}</span>
                <select
                  className="input"
                  value={fieldSources[field] ?? targetId}
                  onChange={(event) =>
                    setFieldSources((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                >
                  {group.map((book) => (
                    <option key={book.id} value={book.id}>
                      {valueLabel(book[field])}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
