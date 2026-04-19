import Dexie, { type Table } from 'dexie';
import type { Book } from '../types/book';

export class LibraryDB extends Dexie {
  books!: Table<Book, string>;

  constructor() {
    super('kutuphanem');
    this.version(1).stores({
      books: 'id, title, author, status, genre, addedAt, updatedAt',
    });
  }
}

export const db = new LibraryDB();
