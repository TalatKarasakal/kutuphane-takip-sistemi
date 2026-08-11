import { Drawer } from "../ui/Drawer";
import { MediaStatusBadge } from "../ui/Badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Media } from "../../types/media";
import { useArtwork } from "../../lib/artwork";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";

interface Props {
  item: Media | null;
  onClose: () => void;
  onEdit: (m: Media) => void;
  onDelete: (id: string) => void;
}

export function MediaDetailDrawer({ item, onClose, onEdit, onDelete }: Props) {
  const visualMode = useSettings((state) => state.visualMode);
  const tags = useTags((state) => state.tags);
  const artwork = useArtwork("media", item?.id ?? "", item?.posterUrl);
  const selectedTags = item
    ? tags.filter((tag) => item.tagIds?.includes(tag.id))
    : [];
  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      title={item?.title ?? ""}
      footer={
        item && (
          <>
            <button
              className="btn btn-ghost text-secondary"
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
            >
              <Trash2 size={16} /> Sil
            </button>
            <button className="btn btn-primary" onClick={() => onEdit(item)}>
              <Pencil size={16} /> Düzenle
            </button>
          </>
        )
      }
    >
      {item && (
        <div className="space-y-4">
          {visualMode === "enriched" && artwork.url && (
            <div className="mx-auto aspect-[2/3] max-h-72 overflow-hidden rounded-xl bg-surface2">
              <img
                src={artwork.url}
                alt={`${item.title} posteri`}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="text-lg font-semibold">{item.title}</div>
            <MediaStatusBadge status={item.status} />
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="chip"
                  style={{ borderColor: tag.color }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Yönetmen" value={item.director} />
            <Info label="Tür" value={item.genre} />
            <Info label="Çıkış Yılı" value={item.releaseYear} />
            <Info label="İzlenme Yılı" value={item.watchYear} />
            {item.type === "film" && (
              <Info
                label="Süre"
                value={
                  item.duration != null ? `${item.duration} dakika` : undefined
                }
              />
            )}
            {item.type === "dizi" && (
              <Info label="Sezon" value={item.seasons} />
            )}
            {item.type === "dizi" && (
              <Info
                label="Bölüm Süresi"
                value={
                  item.episodeDuration != null
                    ? `${item.episodeDuration} dakika`
                    : undefined
                }
              />
            )}
          </dl>

          {item.notes && (
            <div>
              <div className="label">Notlar</div>
              <div className="whitespace-pre-wrap rounded-lg bg-surface2 p-3 text-sm">
                {item.notes}
              </div>
            </div>
          )}

          <div className="text-xs text-muted pt-2 border-t border-border">
            Eklendi: {new Date(item.addedAt).toLocaleString("tr-TR")}
            {item.updatedAt !== item.addedAt &&
              ` · Güncellendi: ${new Date(item.updatedAt).toLocaleString("tr-TR")}`}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <div className="label">{label}</div>
      <div>{value}</div>
    </div>
  );
}
