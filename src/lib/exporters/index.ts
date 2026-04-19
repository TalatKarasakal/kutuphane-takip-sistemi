import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Book } from '../../types/book';
import { downloadBlob } from '../utils';
import { STATUS_LABEL } from '../../constants/statuses';

const ALL_FIELDS: { key: keyof Book; label: string }[] = [
  { key: 'title', label: 'Başlık' },
  { key: 'author', label: 'Yazar' },
  { key: 'publisher', label: 'Yayınevi' },
  { key: 'pageCount', label: 'Sayfa' },
  { key: 'genre', label: 'Tür' },
  { key: 'status', label: 'Durum' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'publicationYear', label: 'Yayın Yılı' },
  { key: 'language', label: 'Dil' },
  { key: 'translator', label: 'Çevirmen' },
  { key: 'rating', label: 'Puan' },
  { key: 'tags', label: 'Etiketler' },
  { key: 'notes', label: 'Notlar' },
  { key: 'readStartDate', label: 'Okumaya Başlama' },
  { key: 'readEndDate', label: 'Okumayı Bitirme' },
  { key: 'addedAt', label: 'Eklenme' },
  { key: 'updatedAt', label: 'Güncelleme' },
];

export const EXPORT_FIELDS = ALL_FIELDS;

function toRow(b: Book, fields: (keyof Book)[]) {
  const r: Record<string, unknown> = {};
  fields.forEach((f) => {
    const label = ALL_FIELDS.find((x) => x.key === f)?.label ?? f;
    let v: unknown = b[f];
    if (f === 'status') v = STATUS_LABEL[b.status];
    if (f === 'tags' && Array.isArray(v)) v = (v as string[]).join(', ');
    r[label] = v ?? '';
  });
  return r;
}

export function exportXlsx(books: Book[], fields: (keyof Book)[], filename: string) {
  const rows = books.map((b) => toRow(b, fields));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kitaplar');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([out], { type: 'application/octet-stream' }), filename);
}

export function exportCsv(books: Book[], fields: (keyof Book)[], filename: string) {
  const rows = books.map((b) => toRow(b, fields));
  const csv = Papa.unparse(rows);
  downloadBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), filename);
}

export function exportJson(books: Book[], fields: (keyof Book)[], filename: string) {
  const data = books.map((b) => {
    const o: Record<string, unknown> = {};
    fields.forEach((f) => { o[f] = b[f] ?? null; });
    return o;
  });
  downloadBlob(new Blob([JSON.stringify({ books: data }, null, 2)], { type: 'application/json' }), filename);
}
