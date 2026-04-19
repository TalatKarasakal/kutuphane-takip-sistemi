import type { Media } from '../../types/media';
import { MediaStatusBadge } from '../ui/Badge';

export function MediaCard({ item, onClick }: { item: Media; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-semibold leading-snug line-clamp-2">{item.title}</div>
        <MediaStatusBadge status={item.status} />
      </div>
      {item.director && (
        <div className="text-sm text-muted mb-3 line-clamp-1">{item.director}</div>
      )}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        {item.releaseYear && <span className="chip">{item.releaseYear}</span>}
        {item.watchYear && <span className="chip">İzlendi: {item.watchYear}</span>}
      </div>
    </button>
  );
}
