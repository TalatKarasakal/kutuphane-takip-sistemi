import { useMemo } from 'react';
import { Film, Tv2 } from 'lucide-react';
import type { Media } from '../../types/media';
import { MediaStatusBadge } from '../ui/Badge';

export function MediaCard({ item, onClick }: { item: Media; onClick: () => void }) {
  const hue = useMemo(
    () => item.title.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360,
    [item.title],
  );
  const TypeIcon = item.type === 'film' ? Film : Tv2;

  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
    >
      <div
        className="relative h-40 w-full overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, hsl(${hue},45%,48%), hsl(${(hue + 45) % 360},45%,36%))` }}
      >
        <TypeIcon size={44} className="text-white/50" />
        <div className="absolute top-2 right-2">
          <MediaStatusBadge status={item.status} />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="font-semibold leading-snug line-clamp-2 text-sm">{item.title}</div>
        {item.director && <div className="text-xs text-muted line-clamp-1">{item.director}</div>}
        <div className="flex flex-wrap items-center gap-1 mt-auto pt-2">
          {item.releaseYear && <span className="chip text-[11px]">{item.releaseYear}</span>}
          {item.watchYear && <span className="chip text-[11px]">İzlendi: {item.watchYear}</span>}
        </div>
      </div>
    </button>
  );
}
