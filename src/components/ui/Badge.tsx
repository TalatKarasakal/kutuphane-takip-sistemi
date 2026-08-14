import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShoppingCart,
  type LucideProps,
} from "lucide-react";
import type { BookStatus } from "../../types/book";
import type { MediaStatus } from "../../types/media";
import { STATUS_LABEL, STATUS_TONE } from "../../constants/statuses";
import {
  MEDIA_STATUS_LABEL,
  MEDIA_STATUS_TONE,
} from "../../constants/mediaStatuses";
import { cn } from "../../lib/utils";

const BOOK_STATUS_ICON: Record<BookStatus, React.ComponentType<LucideProps>> = {
  okundu: CheckCircle2,
  okunacak: Clock,
  mevcut: BookOpen,
  "satin-alinacak": ShoppingCart,
};

const MEDIA_STATUS_ICON: Record<
  MediaStatus,
  React.ComponentType<LucideProps>
> = {
  izlendi: CheckCircle2,
  izlenecek: Clock,
};

/*
 * Durum rozetleri dolgusuz, yalnız kenarlık ve yazı renginde. Renk burada
 * anlam taşıdığı için korunur; tür etiketleri ise tek tip nötr görünür.
 */
export function StatusBadge({ status }: { status: BookStatus }) {
  const Icon = BOOK_STATUS_ICON[status];
  return (
    <span className={cn("chip !bg-transparent", STATUS_TONE[status].badge)}>
      <Icon size={11} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MediaStatusBadge({ status }: { status: MediaStatus }) {
  const Icon = MEDIA_STATUS_ICON[status];
  return (
    <span
      className={cn("chip !bg-transparent", MEDIA_STATUS_TONE[status].badge)}
    >
      <Icon size={11} />
      {MEDIA_STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Tür etiketleri renkle ayrışmaz. On bir tür için on bir renk arayüzü
 * kirletiyor ve hiçbiri anlam taşımıyordu; ayrım tür adının kendisiyle
 * zaten kuruluyor. Görünüm `.chip` sınıfının kendisinden gelir.
 */
export function GenreChip({ genre }: { genre: string }) {
  return <span className="chip">{genre}</span>;
}
