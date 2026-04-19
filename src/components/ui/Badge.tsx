import type { BookStatus } from '../../types/book';
import { STATUS_LABEL } from '../../constants/statuses';

const STATUS_CLASS: Record<BookStatus, string> = {
  okundu: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  okunacak: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20',
  mevcut: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  'satin-alinacak': 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

export function StatusBadge({ status }: { status: BookStatus }) {
  return (
    <span className={`chip border ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
  );
}
