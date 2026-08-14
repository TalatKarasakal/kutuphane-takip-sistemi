import type { BookStatus } from "../types/book";

/**
 * Durumun renk kimliği. Tür etiketleri tek tip nötr görünürken durum
 * etiketleri renk taşır: renk burada anlam ifade ediyor. Değerler
 * `docs/design/arayuz-token-seti.md` §4'ten gelir.
 *
 * `dot` listedeki/karttaki renk şeridi ve kenar çubuğundaki nokta içindir.
 */
export interface StatusTone {
  /** Renk şeridi ve nokta için arka plan sınıfı. */
  dot: string;
  /**
   * Rozetin kenarlığı ve yazısı. Koyu temada vurgu ve çelik mavisi yazı olarak
   * AA'nın altında kaldığı için (2,85 ve 3,41) orada renk kenarlıkta ve noktada
   * kalır, yazı `--text-dim`e düşer; aydınlıkta renkli yazı eşiği geçiyor.
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
      badge: "border-success text-success dark:text-dim",
    },
  },
  {
    value: "okunacak",
    label: "Okunacak",
    tone: {
      dot: "bg-glow",
      badge: "border-glow text-glow dark:text-dim",
    },
  },
  {
    // Dolgusuz, yalnız kenarlıklı: elde bulunmak bir aşama değil, nötr bir not.
    value: "mevcut",
    label: "Elimde Mevcut",
    tone: {
      dot: "bg-mute",
      badge: "border-line-strong text-mute",
    },
  },
  {
    value: "satin-alinacak",
    label: "Satın Alınacak",
    tone: {
      dot: "bg-accent",
      badge: "border-accent text-accent dark:text-dim",
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
