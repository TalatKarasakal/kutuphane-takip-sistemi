import { Film, Tv2 } from "lucide-react";
import type { Media } from "../../types/media";
import { MediaStatusBadge } from "../ui/Badge";
import { useArtwork } from "../../lib/artwork";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";
import { MEDIA_STATUS_TONE } from "../../constants/mediaStatuses";

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
      {/* Kartın tamamı tıklanabilir olsun diye düğme içeriğin üstüne serilir;
          onay kutusu ise akışın içinde durur ki başlığı örtmesin. */}
      <button
        type="button"
        onClick={onClick}
        aria-label={`${item.title} ayrıntılarını aç`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {visualMode === "enriched" && artwork.url ? (
        <div className="aspect-[2/3] shrink-0 bg-hover">
          <img
            src={artwork.url}
            alt={`${item.title} posteri`}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          className={`h-1 w-full shrink-0 ${MEDIA_STATUS_TONE[item.status].dot}`}
        />
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`${item.title} seç`}
            className="row-check relative z-20 mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <div className="font-semibold leading-snug line-clamp-2">
            {item.title}
          </div>
        </div>
        {item.director && (
          <div className="text-xs text-mute line-clamp-1">{item.director}</div>
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
    </article>
  );
}
