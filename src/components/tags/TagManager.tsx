import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useTags } from "../../store/tagsStore";

export function TagManager() {
  const { tags, update, remove } = useTags();
  const [editing, setEditing] = useState<
    Record<string, { name: string; color: string }>
  >({});

  return (
    <div className="rounded-xl border border-line divide-y divide-line">
      {tags.length === 0 && (
        <div className="p-3 text-xs text-mute">
          Etiketler kitap veya medya formundan oluşturulabilir.
        </div>
      )}
      {tags.map((tag) => {
        const draft = editing[tag.id] ?? { name: tag.name, color: tag.color };
        return (
          <div key={tag.id} className="p-2 flex items-center gap-2">
            <input
              type="color"
              value={draft.color}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  [tag.id]: { ...draft, color: event.target.value },
                })
              }
              className="h-8 w-10 rounded border border-line bg-panel p-1"
              aria-label={`${tag.name} rengi`}
            />
            <input
              className="input"
              maxLength={40}
              value={draft.name}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  [tag.id]: { ...draft, name: event.target.value },
                })
              }
            />
            <button
              type="button"
              className="btn btn-ghost"
              aria-label="Etiketi kaydet"
              onClick={async () => {
                await update(tag.id, draft);
                setEditing((current) => {
                  const next = { ...current };
                  delete next[tag.id];
                  return next;
                });
              }}
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              className="btn btn-ghost text-accent"
              aria-label="Etiketi sil"
              onClick={() => remove(tag.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
