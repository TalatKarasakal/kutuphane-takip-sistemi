import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Book } from '../../types/book';
import type { Media } from '../../types/media';
import { downloadBlob } from '../utils';
import { STATUS_LABEL } from '../../constants/statuses';
import { MEDIA_STATUS_LABEL } from '../../constants/mediaStatuses';

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

const MEDIA_ALL_FIELDS: { key: keyof Media; label: string }[] = [
  { key: 'title', label: 'Başlık' },
  { key: 'type', label: 'Tür' },
  { key: 'director', label: 'Yönetmen' },
  { key: 'releaseYear', label: 'Çıkış Yılı' },
  { key: 'watchYear', label: 'İzlenme Yılı' },
  { key: 'duration', label: 'Süre (dk)' },
  { key: 'seasons', label: 'Sezon' },
  { key: 'episodeDuration', label: 'Bölüm Süresi (dk)' },
  { key: 'status', label: 'Durum' },
  { key: 'notes', label: 'Notlar' },
  { key: 'addedAt', label: 'Eklenme' },
  { key: 'updatedAt', label: 'Güncelleme' },
];

export const MEDIA_EXPORT_FIELDS = MEDIA_ALL_FIELDS;

function toMediaRow(m: Media, fields: (keyof Media)[]) {
  const r: Record<string, unknown> = {};
  fields.forEach((f) => {
    const label = MEDIA_ALL_FIELDS.find((x) => x.key === f)?.label ?? f;
    let v: unknown = m[f];
    if (f === 'status') v = MEDIA_STATUS_LABEL[m.status];
    if (f === 'type') v = m.type === 'film' ? 'Film' : 'Dizi';
    r[label] = v ?? '';
  });
  return r;
}

export function exportMediaXlsx(media: Media[], fields: (keyof Media)[], filename: string) {
  const rows = media.map((m) => toMediaRow(m, fields));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Medya');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([out], { type: 'application/octet-stream' }), filename);
}

export function exportMediaCsv(media: Media[], fields: (keyof Media)[], filename: string) {
  const rows = media.map((m) => toMediaRow(m, fields));
  const csv = Papa.unparse(rows);
  downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), filename);
}

export function exportMediaJson(media: Media[], fields: (keyof Media)[], filename: string) {
  const data = media.map((m) => {
    const o: Record<string, unknown> = {};
    fields.forEach((f) => { o[f] = m[f] ?? null; });
    return o;
  });
  downloadBlob(new Blob([JSON.stringify({ media: data }, null, 2)], { type: 'application/json' }), filename);
}
