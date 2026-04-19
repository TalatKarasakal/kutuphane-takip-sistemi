export type BookStatus = 'okundu' | 'okunacak' | 'mevcut' | 'satin-alinacak';

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
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accent: 'turkuaz',
  fontFamily: 'Inter',
  fontSize: 15,
  density: 'comfortable',
  view: 'table',
};
