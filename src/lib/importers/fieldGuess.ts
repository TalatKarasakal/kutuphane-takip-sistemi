import type { BookField } from '../../types/book';

const norm = (s: string) => s.trim().toLocaleLowerCase('tr').replace(/[._\-]+/g, ' ').replace(/\s+/g, ' ');

export type MediaMappableField =
  | 'title'
  | 'director'
  | 'releaseYear'
  | 'watchYear'
  | 'duration'
  | 'seasons'
  | 'episodeDuration'
  | 'status'
  | 'notes'
  | '__ignore__';

export const MEDIA_FIELD_LABELS: Record<MediaMappableField, string> = {
  title: 'Başlık',
  director: 'Yönetmen',
  releaseYear: 'Çıkış Yılı',
  watchYear: 'İzlenme Yılı',
  duration: 'Süre (dk)',
  seasons: 'Sezon',
  episodeDuration: 'Bölüm Süresi (dk)',
  status: 'Durum',
  notes: 'Notlar',
  __ignore__: '— Yoksay —',
};

const MEDIA_CANDIDATES: Record<Exclude<MediaMappableField, '__ignore__'>, string[]> = {
  title: ['title', 'başlık', 'baslik', 'film', 'dizi', 'ad', 'name', 'film adı', 'dizi adı'],
  director: ['director', 'yönetmen', 'yonetmen', 'yöneten', 'yoneten'],
  releaseYear: ['year', 'yıl', 'yil', 'çıkış yılı', 'cikis yili', 'release year', 'yapım yılı', 'yapim yili'],
  watchYear: ['watch year', 'izlenme yılı', 'izlenme yili', 'watched year', 'izledim yılı'],
  duration: ['duration', 'süre', 'sure', 'dakika', 'minutes', 'runtime', 'length', 'süre (dk)'],
  seasons: ['seasons', 'sezon', 'season count', 'sezon sayısı', 'sezon sayisi'],
  episodeDuration: ['episode duration', 'bölüm süresi', 'bolum suresi', 'episode length', 'bölüm dk', 'bolum dk'],
  status: ['status', 'durum', 'izleme durumu', 'state'],
  notes: ['notes', 'not', 'notlar', 'yorum', 'yorumlar', 'comment'],
};

export function guessMediaField(header: string): MediaMappableField {
  const n = norm(header);
  for (const [field, list] of Object.entries(MEDIA_CANDIDATES)) {
    if (list.some((c) => norm(c) === n)) return field as MediaMappableField;
  }
  for (const [field, list] of Object.entries(MEDIA_CANDIDATES)) {
    if (list.some((c) => n.includes(norm(c)) || norm(c).includes(n))) return field as MediaMappableField;
  }
  return '__ignore__';
}

export const MAPPABLE_MEDIA_FIELDS = Object.keys(MEDIA_FIELD_LABELS) as MediaMappableField[];

export type MappableField =
  | 'title'
  | 'author'
  | 'publisher'
  | 'pageCount'
  | 'genre'
  | 'isbn'
  | 'publicationYear'
  | 'language'
  | 'translator'
  | 'status'
  | 'notes'
  | 'readStartDate'
  | 'readEndDate'
  | '__ignore__';

export const FIELD_LABELS: Record<MappableField, string> = {
  title: 'Başlık',
  author: 'Yazar',
  publisher: 'Yayınevi',
  pageCount: 'Sayfa Sayısı',
  genre: 'Tür',
  isbn: 'ISBN',
  publicationYear: 'Yayın Yılı',
  language: 'Dil',
  translator: 'Çevirmen',
  status: 'Durum',
  notes: 'Notlar',
  readStartDate: 'Okumaya Başlama',
  readEndDate: 'Okumayı Bitirme',
  __ignore__: '— Yoksay —',
};

const CANDIDATES: Record<Exclude<MappableField, '__ignore__'>, string[]> = {
  title: ['title', 'başlık', 'baslik', 'kitap', 'kitap adı', 'kitap adi', 'ad', 'ad ı', 'name', 'book', 'book title'],
  author: ['author', 'yazar', 'writer', 'yazan'],
  publisher: ['publisher', 'yayınevi', 'yayinevi', 'yayın evi', 'yayin evi', 'basım', 'basim', 'yayınlayan', 'yayinlayan'],
  pageCount: ['pages', 'page count', 'sayfa', 'sayfa sayısı', 'sayfa sayisi', 'sayfa sayisı'],
  genre: ['genre', 'category', 'tür', 'tur', 'kategori', 'tip', 'type'],
  isbn: ['isbn', 'isbn-10', 'isbn-13', 'isbn10', 'isbn13'],
  publicationYear: ['year', 'yıl', 'yil', 'yayın yılı', 'yayin yili', 'basım yılı', 'basim yili', 'publication year'],
  language: ['language', 'dil', 'lang'],
  translator: ['translator', 'çevirmen', 'cevirmen', 'çeviren', 'ceviren'],
  status: ['status', 'durum', 'state', 'okuma durumu', 'okundu mu'],
  notes: ['notes', 'not', 'notlar', 'yorum', 'yorumlar', 'comment'],
  readStartDate: ['start', 'başlangıç', 'baslangic', 'okumaya başlama', 'okumaya baslama', 'read start'],
  readEndDate: ['end', 'bitiş', 'bitis', 'okumayı bitirme', 'okumayi bitirme', 'read end', 'bitirme'],
};

export function guessField(header: string): MappableField {
  const n = norm(header);
  for (const [field, list] of Object.entries(CANDIDATES)) {
    if (list.some((c) => norm(c) === n)) return field as MappableField;
  }
  for (const [field, list] of Object.entries(CANDIDATES)) {
    if (list.some((c) => n.includes(norm(c)) || norm(c).includes(n))) return field as MappableField;
  }
  return '__ignore__';
}

export const MAPPABLE_FIELDS = Object.keys(FIELD_LABELS) as MappableField[];

export function isBookField(f: MappableField): f is Exclude<MappableField, '__ignore__'> {
  return f !== '__ignore__';
}

export type _BookFieldShape = BookField; // keeps compat
