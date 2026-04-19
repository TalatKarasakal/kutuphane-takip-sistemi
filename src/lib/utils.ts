import clsx, { type ClassValue } from 'clsx';

export const cn = (...v: ClassValue[]) => clsx(v);

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseNumber(v: unknown): number | undefined {
  if (v == null || v === '') return undefined;
  const s = String(v).replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function parseTags(v: unknown): string[] | undefined {
  if (v == null || v === '') return undefined;
  if (Array.isArray(v)) return v.map(String);
  return String(v).split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
}

export function smartTitleCase(prev: string, next: string): string {
  if (next.length !== prev.length + 1) return next;
  if (!next.startsWith(prev)) return next;
  const i = next.length - 1;
  const ch = next[i];
  const prevCh = i > 0 ? next[i - 1] : '';
  const shouldCap = (i === 0 || /\s/.test(prevCh)) && /\p{L}/u.test(ch);
  return shouldCap ? next.slice(0, i) + ch.toLocaleUpperCase('tr') : next;
}
