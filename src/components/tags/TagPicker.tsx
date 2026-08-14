import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTags } from "../../store/tagsStore";
import { TAG_COLORS } from "../../types/library";

export function TagPicker({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (ids: string[]) => void;
}) {
  const { tags, add } = useTags();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const tag = await add(name, color);
      if (!value.includes(tag.id)) onChange([...value, tag.id]);
      setName("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Etiketler"
      >
        {tags.length === 0 && (
          <span className="text-xs text-mute">Henüz etiket yok.</span>
        )}
        {tags.map((tag) => {
          const active = value.includes(tag.id);
          return (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggle(tag.id)}
              aria-pressed={active}
              className="chip border transition-opacity"
              style={{
                borderColor: tag.color,
                backgroundColor: active ? `${tag.color}25` : "transparent",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              {active && <X size={11} />}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={name}
          maxLength={40}
          placeholder="Yeni etiket…"
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-9 w-11 rounded-lg border border-line bg-panel p-1"
          aria-label="Etiket rengi"
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={create}
          disabled={busy || !name.trim()}
        >
          <Plus size={14} /> Ekle
        </button>
      </div>
    </div>
  );
}
