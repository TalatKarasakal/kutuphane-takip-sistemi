import type { BookField } from '../../types/book';

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
  | 'rating'
  | 'notes'
  | 'tags'
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
  rating: 'Puan',
  notes: 'Notlar',
  tags: 'Etiketler',
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
  rating: ['rating', 'puan', 'score', 'not', 'yıldız', 'yildiz', 'stars'],
  notes: ['notes', 'not', 'notlar', 'yorum', 'yorumlar', 'comment'],
  tags: ['tags', 'etiket', 'etiketler', 'labels'],
  readStartDate: ['start', 'başlangıç', 'baslangic', 'okumaya başlama', 'okumaya baslama', 'read start'],
  readEndDate: ['end', 'bitiş', 'bitis', 'okumayı bitirme', 'okumayi bitirme', 'read end', 'bitirme'],
};

const norm = (s: string) => s.trim().toLocaleLowerCase('tr').replace(/[._\-]+/g, ' ').replace(/\s+/g, ' ');

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
