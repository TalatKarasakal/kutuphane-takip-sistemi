/**
 * Etiket rengi seçicide sunulan hazır renkler. Bunlar arayüz token'ı değil
 * veridir — kullanıcı seçer, veritabanında saklanır — bu yüzden hex olarak
 * durur. Değerler yine de token setinin ailelerinden alınmıştır; önceki liste
 * palet dışı canlı renkler içeriyordu. Kayıtlı etiketler kendi rengini korur.
 */
export const TAG_COLORS = [
  "#8e2433", // bordo — vurgu
  "#a3202c", // bordo, sıcak uç
  "#2b3b5e", // lacivert
  "#2a5a9e", // çelik mavisi
  "#1e7f52", // yeşil
  "#6b5e42", // sıcak nötr
  "#8a6a3d", // kehribar nötr
  "#5a6470", // gri
] as const;

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveLoan {
  bookId: string;
  borrower: string;
  loanedAt: string;
  dueAt?: string;
}

export type ArtworkOwnerType = "book" | "media";

export interface ArtworkCache {
  key: string;
  ownerType: ArtworkOwnerType;
  ownerId: string;
  sourceUrl: string;
  blob: Blob;
  mimeType: string;
  size: number;
  lastAccessedAt: string;
  updatedAt: string;
}

export type TagFilterMode = "or" | "and";

/** Uygulamanın üst düzey bölümleri; hem kabuk hem de mağazalar tarafından kullanılır. */
export type Section = "books" | "movies" | "tv";
