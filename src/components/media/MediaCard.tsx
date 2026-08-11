import { Film, Tv2 } from "lucide-react";
import type { Media, MediaStatus } from "../../types/media";
import { MediaStatusBadge } from "../ui/Badge";
import { useArtwork } from "../../lib/artwork";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";

const STATUS_STRIPE: Record<MediaStatus, string> = {
  izlendi: "bg-emerald-500",
  izlenecek: "bg-sky-500",
};

export function MediaCard({
  item,
  onClick,
  selected,
  onToggleSelect,
}: {
  item: Media;
  onClick: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const visualMode = useSettings((state) => state.visualMode);
  const tags = useTags((state) => state.tags);
  const artwork = useArtwork("media", item.id, item.posterUrl);
  const TypeIcon = item.type === "film" ? Film : Tv2;
  return (
    <article
      className={`card relative overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <label
        className="absolute left-2 top-2 z-10 rounded-md bg-surface/90 p-1 shadow-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`${item.title} seç`}
        />
      </label>
      <button onClick={onClick} className="text-left flex flex-col flex-1">
        {visualMode === "enriched" && artwork.url ? (
          <div className="aspect-[2/3] bg-surface2">
            <img
              src={artwork.url}
              alt={`${item.title} posteri`}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className={`h-1 w-full ${STATUS_STRIPE[item.status]}`} />
        )}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="font-semibold leading-snug line-clamp-2">
            {item.title}
          </div>
          {item.director && (
            <div className="text-xs text-muted line-clamp-1">
              {item.director}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
            <MediaStatusBadge status={item.status} />
            <span className="chip text-[11px]">
              <TypeIcon size={10} />
              {item.type === "film" ? "Film" : "Dizi"}
            </span>
            {tags
              .filter((tag) => item.tagIds?.includes(tag.id))
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag.id}
                  className="chip text-[10px]"
                  style={{ borderColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
          </div>
        </div>
      </button>
    </article>
  );
}
