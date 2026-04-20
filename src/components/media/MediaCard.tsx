import { useMemo } from 'react';
import { Film, Tv2 } from 'lucide-react';
import type { Media, MediaStatus } from '../../types/media';
import { MediaStatusBadge } from '../ui/Badge';

const MEDIA_STATUS_STRIPE: Record<MediaStatus, string> = {
  izlendi: 'bg-emerald-500',
  izlenecek: 'bg-sky-500',
};

export function MediaCard({ item, onClick }: { item: Media; onClick: () => void }) {
  const hue = useMemo(
    () => item.title.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360,
    [item.title],
  );
  const TypeIcon = item.type === 'film' ? Film : Tv2;
  const typeLabel = item.type === 'film' ? 'Film' : 'Dizi';

  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
    >
      <div className={`h-1 w-full shrink-0 ${MEDIA_STATUS_STRIPE[item.status]}`} />

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="font-semibold leading-snug line-clamp-2">{item.title}</div>
        {item.director && <div className="text-xs text-muted line-clamp-1">{item.director}</div>}
        <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
          <MediaStatusBadge status={item.status} />
          <span
            className="chip text-[11px] flex items-center gap-1"
            style={{ background: `linear-gradient(135deg, hsl(${hue},40%,55%), hsl(${(hue + 45) % 360},40%,45%))`, color: 'white', borderColor: 'transparent' }}
          >
            <TypeIcon size={10} /> {typeLabel}
          </span>
          {item.releaseYear && <span className="chip text-[11px]">{item.releaseYear}</span>}
          {item.watchYear && <span className="chip text-[11px]">İzlendi: {item.watchYear}</span>}
        </div>
      </div>
    </button>
  );
}
