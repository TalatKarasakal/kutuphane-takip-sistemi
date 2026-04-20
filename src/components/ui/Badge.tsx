import { BookOpen, CheckCircle2, Clock, ShoppingCart, type LucideProps } from 'lucide-react';
import type { BookStatus } from '../../types/book';
import type { MediaStatus } from '../../types/media';
import { STATUS_LABEL } from '../../constants/statuses';
import { MEDIA_STATUS_LABEL } from '../../constants/mediaStatuses';
import { cn } from '../../lib/utils';

const STATUS_CLASS: Record<BookStatus, string> = {
  okundu: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  okunacak: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20',
  mevcut: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  'satin-alinacak': 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

const BOOK_STATUS_ICON: Record<BookStatus, React.ComponentType<LucideProps>> = {
  okundu: CheckCircle2,
  okunacak: Clock,
  mevcut: BookOpen,
  'satin-alinacak': ShoppingCart,
};

const MEDIA_STATUS_CLASS: Record<MediaStatus, string> = {
  izlendi: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  izlenecek: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20',
};

const MEDIA_STATUS_ICON: Record<MediaStatus, React.ComponentType<LucideProps>> = {
  izlendi: CheckCircle2,
  izlenecek: Clock,
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const Icon = BOOK_STATUS_ICON[status];
  return (
    <span className={cn('chip border', STATUS_CLASS[status])}>
      <Icon size={11} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MediaStatusBadge({ status }: { status: MediaStatus }) {
  const Icon = MEDIA_STATUS_ICON[status];
  return (
    <span className={cn('chip border', MEDIA_STATUS_CLASS[status])}>
      <Icon size={11} />
      {MEDIA_STATUS_LABEL[status]}
    </span>
  );
}

const GENRE_COLORS = [
  'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
  'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
  'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20',
  'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20',
  'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20',
  'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
];

export function genreColorClass(genre: string): string {
  const hash = genre.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GENRE_COLORS[hash % GENRE_COLORS.length];
}

export function GenreChip({ genre }: { genre: string }) {
  return (
    <span className={cn('chip border', genreColorClass(genre))}>{genre}</span>
  );
}
