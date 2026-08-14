import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShoppingCart,
  type LucideProps,
} from "lucide-react";
import type { BookStatus } from "../../types/book";
import type { MediaStatus } from "../../types/media";
import { STATUS_LABEL } from "../../constants/statuses";
import { MEDIA_STATUS_LABEL } from "../../constants/mediaStatuses";
import { cn } from "../../lib/utils";

/*
 * Durum renkleri palet ailelerine oturtuldu; yeşil/mavi/sarı/kırmızı ayrımı
 * korunuyor ama tonlar paletten geliyor: Turkuaz (tamamlandı), Elektrik Mavi
 * (sırada), Kemik (elde mevcut), Bordo (alınacak).
 */
const STATUS_CLASS: Record<BookStatus, string> = {
  okundu:
    "bg-turkuaz-500/15 text-turkuaz-800 dark:text-turkuaz-300 border-turkuaz-500/25",
  okunacak:
    "bg-elektrik-500/15 text-elektrik-800 dark:text-elektrik-300 border-elektrik-500/25",
  mevcut:
    "bg-kemik-500/20 text-kemik-800 dark:text-kemik-300 border-kemik-500/30",
  "satin-alinacak":
    "bg-bordo-600/15 text-bordo-700 dark:text-bordo-300 border-bordo-600/25",
};

const BOOK_STATUS_ICON: Record<BookStatus, React.ComponentType<LucideProps>> = {
  okundu: CheckCircle2,
  okunacak: Clock,
  mevcut: BookOpen,
  "satin-alinacak": ShoppingCart,
};

const MEDIA_STATUS_CLASS: Record<MediaStatus, string> = {
  izlendi:
    "bg-turkuaz-500/15 text-turkuaz-800 dark:text-turkuaz-300 border-turkuaz-500/25",
  izlenecek:
    "bg-elektrik-500/15 text-elektrik-800 dark:text-elektrik-300 border-elektrik-500/25",
};

const MEDIA_STATUS_ICON: Record<
  MediaStatus,
  React.ComponentType<LucideProps>
> = {
  izlendi: CheckCircle2,
  izlenecek: Clock,
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const Icon = BOOK_STATUS_ICON[status];
  return (
    <span className={cn("chip border", STATUS_CLASS[status])}>
      <Icon size={11} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MediaStatusBadge({ status }: { status: MediaStatus }) {
  const Icon = MEDIA_STATUS_ICON[status];
  return (
    <span className={cn("chip border", MEDIA_STATUS_CLASS[status])}>
      <Icon size={11} />
      {MEDIA_STATUS_LABEL[status]}
    </span>
  );
}

/*
 * Tür rozetleri paletin altı ailesinden gelir. Rastgele renk yerine sınırlı
 * bir küme kullanmak, çok türlü bir listede bile ekranın tek bir renk dili
 * konuşmasını sağlıyor.
 */
const GENRE_COLORS = [
  "bg-elektrik-500/15 text-elektrik-800 dark:text-elektrik-300 border-elektrik-500/25",
  "bg-turkuaz-500/15 text-turkuaz-800 dark:text-turkuaz-300 border-turkuaz-500/25",
  "bg-kemik-500/20 text-kemik-800 dark:text-kemik-300 border-kemik-500/30",
  "bg-bordo-600/15 text-bordo-700 dark:text-bordo-300 border-bordo-600/25",
  "bg-bordo-800/15 text-bordo-800 dark:text-bordo-200 border-bordo-800/25",
  "bg-petrol-500/15 text-petrol-700 dark:text-petrol-200 border-petrol-500/25",
  "bg-notr-500/15 text-notr-700 dark:text-notr-200 border-notr-500/25",
];

export function genreColorClass(genre: string): string {
  const hash = genre.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GENRE_COLORS[hash % GENRE_COLORS.length];
}

export function GenreChip({ genre }: { genre: string }) {
  return (
    <span className={cn("chip border", genreColorClass(genre))}>{genre}</span>
  );
}
