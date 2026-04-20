export type BookStatus = 'okundu' | 'okunacak' | 'mevcut' | 'satin-alinacak';

export interface ColumnConfig {
  key: string;
  visible: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  pageCount?: number;
  genre?: string;
  isbn?: string;
  publicationYear?: number;
  language?: string;
  translator?: string;
  status: BookStatus;
  rating?: number;
  notes?: string;
  tags?: string[];
  coverUrl?: string;
  readStartDate?: string;
  readEndDate?: string;
  addedAt: string;
  updatedAt: string;
}

export type BookField = keyof Book;

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accent: 'turkuaz' | 'kirmizi';
  fontFamily: string;
  fontSize: number;
  density: 'comfortable' | 'compact';
  view: 'table' | 'card';
  bookColumns: ColumnConfig[];
  filmColumns: ColumnConfig[];
  tvColumns: ColumnConfig[];
}

export const DEFAULT_BOOK_COLS: ColumnConfig[] = [
  { key: 'title', visible: true },
  { key: 'author', visible: true },
  { key: 'publisher', visible: true },
  { key: 'genre', visible: true },
  { key: 'pageCount', visible: true },
  { key: 'publicationYear', visible: false },
  { key: 'status', visible: true },
];

export const DEFAULT_FILM_COLS: ColumnConfig[] = [
  { key: 'title', visible: true },
  { key: 'director', visible: true },
  { key: 'releaseYear', visible: true },
  { key: 'duration', visible: true },
  { key: 'watchYear', visible: true },
  { key: 'status', visible: true },
];

export const DEFAULT_TV_COLS: ColumnConfig[] = [
  { key: 'title', visible: true },
  { key: 'director', visible: true },
  { key: 'releaseYear', visible: true },
  { key: 'seasons', visible: true },
  { key: 'episodeDuration', visible: true },
  { key: 'watchYear', visible: true },
  { key: 'status', visible: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accent: 'turkuaz',
  fontFamily: 'Inter',
  fontSize: 15,
  density: 'comfortable',
  view: 'table',
  bookColumns: DEFAULT_BOOK_COLS,
  filmColumns: DEFAULT_FILM_COLS,
  tvColumns: DEFAULT_TV_COLS,
};
