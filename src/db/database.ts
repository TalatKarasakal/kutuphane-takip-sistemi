import Dexie, { type Table } from 'dexie';
import type { Book } from '../types/book';
import type { Media } from '../types/media';

export class LibraryDB extends Dexie {
  books!: Table<Book, string>;
  media!: Table<Media, string>;

  constructor() {
    super('kutuphanem');
    this.version(1).stores({
      books: 'id, title, author, status, genre, addedAt, updatedAt',
    });
    this.version(2).stores({
      books: 'id, title, author, status, genre, addedAt, updatedAt',
      media: 'id, title, type, status, addedAt, updatedAt',
    });
  }
}

export const db = new LibraryDB();
