import { Star } from "lucide-react";
import type { Book, BookStatus } from "../../types/book";
import { StatusBadge, GenreChip } from "../ui/Badge";
import { useArtwork } from "../../lib/artwork";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";

const STATUS_STRIPE: Record<BookStatus, string> = {
  okundu: "bg-emerald-500",
  okunacak: "bg-sky-500",
  mevcut: "bg-amber-500",
  "satin-alinacak": "bg-rose-500",
};

export function BookCard({
  book,
  onClick,
  selected,
  onToggleSelect,
}: {
  book: Book;
  onClick: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const visualMode = useSettings((state) => state.visualMode);
  const tags = useTags((state) => state.tags);
  const artwork = useArtwork(
    "book",
    book.id,
    visualMode === "enriched" ? book.coverUrl : undefined,
  );
  const selectedTags = tags.filter((tag) => book.tagIds?.includes(tag.id));

  return (
    <article
      className={`card relative overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      {/* Kartın tamamı tıklanabilir olsun diye düğme içeriğin üstüne serilir;
          onay kutusu ise akışın içinde durur ki başlığı örtmesin. */}
      <button
        type="button"
        onClick={onClick}
        aria-label={`${book.title} ayrıntılarını aç`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      {visualMode === "enriched" && artwork.url ? (
        <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-surface2">
          <img
            src={artwork.url}
            alt={`${book.title} kapağı`}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className={`h-1 w-full shrink-0 ${STATUS_STRIPE[book.status]}`} />
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`${book.title} seç`}
            className="relative z-20 mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--primary))]"
          />
          <div className="font-semibold leading-snug line-clamp-2">
            {book.title}
          </div>
        </div>
        <div className="text-xs text-muted line-clamp-1">{book.author}</div>
        {book.rating && (
          <div className="flex" aria-label={`${book.rating} yıldız`}>
            {Array.from({ length: book.rating }, (_, index) => (
              <Star
                key={index}
                size={12}
                className="fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
          <StatusBadge status={book.status} />
          {book.genre && <GenreChip genre={book.genre} />}
          {selectedTags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="chip text-[10px]"
              style={{ borderColor: tag.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
