import type { BookStatus } from '../types/book';

export const STATUSES: { value: BookStatus; label: string; color: string }[] = [
  { value: 'okundu', label: 'Okundu', color: 'emerald' },
  { value: 'okunacak', label: 'Okunacak', color: 'sky' },
  { value: 'mevcut', label: 'Elimde Mevcut', color: 'amber' },
  { value: 'satin-alinacak', label: 'Satın Alınacak', color: 'rose' },
];

export const STATUS_LABEL: Record<BookStatus, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
) as Record<BookStatus, string>;

export function normalizeStatus(raw: unknown): BookStatus | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim().toLowerCase();
  if (['okundu', 'read', 'bitti', 'tamamlandı', 'tamamlandi', 'okudum', 'finished', 'done'].includes(s)) return 'okundu';
  if (['okunacak', 'to-read', 'to read', 'okumadım', 'okumadim', 'okuyacağım', 'okuyacagim', 'wishlist-read'].includes(s)) return 'okunacak';
  if (['mevcut', 'elimde', 'owned', 'kütüphanemde', 'kutuphanemde', 'library'].includes(s)) return 'mevcut';
  if (['satın alınacak', 'satin alinacak', 'satın-alınacak', 'alınacak', 'alinacak', 'to-buy', 'wishlist', 'to buy', 'buy'].includes(s)) return 'satin-alinacak';
  return undefined;
}
