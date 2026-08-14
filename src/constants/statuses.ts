import type { BookStatus } from "../types/book";

/**
 * Durumun renk kimliği. Tür etiketleri tek tip nötr görünürken durum
 * etiketleri renk taşır: renk burada anlam ifade ediyor. Değerler
 * `docs/design/arayuz-token-seti.md` §4'ten gelir.
 *
 * `dot` listedeki/karttaki renk şeridi ve kenar çubuğundaki nokta içindir.
 */
export interface StatusTone {
  /** Liste/kart renk şeridi ve kenar çubuğundaki nokta. */
  dot: string;
  /**
   * Rozetin tamamı. "Okundu" ve "Okunacak" dolguludur; "Elimde Mevcut" ve
   * "Satın Alınacak" yalnız kenarlıklıdır — bordo dolgu, karanlık temada
   * birincil eylem düğmesiyle yarışıyor.
   *
   * Dolgulu rozetlerde yazı rengi zemine göre seçilir: aydınlık temanın koyu
   * dolgularında beyaz, karanlık temanın parlak yeşilinde koyu mürekkep
   * (beyaz orada 2,8:1'de kalıyor). "Satın Alınacak" karanlık temada dolgusuz
   * kalmak zorunda ama bordo yazı orada 2,85:1 veriyor; renk kenarlıkta
   * bırakılıp yazı okunur tona alındı.
   */
  badge: string;
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
      dot: "bg-success",
      badge: "border-success bg-success text-white dark:text-app",
    },
  },
  {
    value: "okunacak",
    label: "Okunacak",
    tone: {
      dot: "bg-glow",
      badge: "border-glow bg-glow text-white",
    },
  },
  {
    value: "mevcut",
    label: "Elimde Mevcut",
    tone: {
      dot: "bg-mute",
      badge: "border-line-strong !bg-transparent text-mute",
    },
  },
  {
    value: "satin-alinacak",
    label: "Satın Alınacak",
    tone: {
      dot: "bg-warn",
      badge: "border-warn !bg-transparent text-warn dark:text-dim",
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
