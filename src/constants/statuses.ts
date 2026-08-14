import type { BookStatus } from "../types/book";

/**
 * Durumun renk kimliği. `dot` listedeki/karttaki renk şeridi ve kenar
 * çubuğundaki nokta için, `tint` seçili filtre satırı için kullanılır.
 * Renkler kişisel paletin ailelerinden gelir (bkz. `src/index.css`).
 */
export interface StatusTone {
  dot: string;
  tint: string;
}

export const STATUSES: {
  value: BookStatus;
  label: string;
  tone: StatusTone;
}[] = [
  {
    value: "okundu",
    label: "Okundu",
    tone: {
      dot: "bg-turkuaz-500",
      tint: "bg-turkuaz-500/15 text-turkuaz-800 dark:text-turkuaz-300",
    },
  },
  {
    value: "okunacak",
    label: "Okunacak",
    tone: {
      dot: "bg-elektrik-500",
      tint: "bg-elektrik-500/15 text-elektrik-800 dark:text-elektrik-300",
    },
  },
  {
    value: "mevcut",
    label: "Elimde Mevcut",
    tone: {
      dot: "bg-kemik-500",
      tint: "bg-kemik-500/20 text-kemik-800 dark:text-kemik-300",
    },
  },
  {
    value: "satin-alinacak",
    label: "Satın Alınacak",
    tone: {
      dot: "bg-bordo-600",
      tint: "bg-bordo-600/15 text-bordo-700 dark:text-bordo-300",
    },
  },
];

export const STATUS_LABEL: Record<BookStatus, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
) as Record<BookStatus, string>;

export const STATUS_TONE: Record<BookStatus, StatusTone> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.tone]),
) as Record<BookStatus, StatusTone>;

export function normalizeStatus(raw: unknown): BookStatus | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim().toLowerCase();
  if (
    [
      "okundu",
      "read",
      "bitti",
      "tamamlandı",
      "tamamlandi",
      "okudum",
      "finished",
      "done",
    ].includes(s)
  )
    return "okundu";
  if (
    [
      "okunacak",
      "to-read",
      "to read",
      "okumadım",
      "okumadim",
      "okuyacağım",
      "okuyacagim",
      "wishlist-read",
    ].includes(s)
  )
    return "okunacak";
  if (
    [
      "mevcut",
      "elimde",
      "owned",
      "kütüphanemde",
      "kutuphanemde",
      "library",
    ].includes(s)
  )
    return "mevcut";
  if (
    [
      "satın alınacak",
      "satin alinacak",
      "satın-alınacak",
      "alınacak",
      "alinacak",
      "to-buy",
      "wishlist",
      "to buy",
      "buy",
    ].includes(s)
  )
    return "satin-alinacak";
  return undefined;
}
