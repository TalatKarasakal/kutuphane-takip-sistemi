import { describe, expect, it } from 'vitest';
import { applyFilters, findDuplicateIds } from '../src/lib/filters';
import type { Book } from '../src/types/book';

const book = (id: string, title: string, author = 'Bilinmiyor', isbn?: string): Book => ({
  id,
  title,
  author,
  isbn,
  status: 'mevcut',
  addedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('collection filters', () => {
  it('finds duplicate ISBN values after normalization', () => {
    const duplicates = findDuplicateIds([
      book('a', 'Bir', 'Yazar', '978-1-23'),
      book('b', 'İki', 'Başka', '978123'),
      book('c', 'Üç', 'Yazar', '123'),
    ]);

    expect([...duplicates]).toEqual(['a', 'b']);
  });

  it('uses Turkish casing during search', () => {
    const result = applyFilters([book('a', 'Işık', 'İlker')], {
      search: 'ışık',
      statusFilter: [],
      genreFilter: [],
      sortKey: 'title',
      sortDir: 'asc',
    });

    expect(result).toHaveLength(1);
  });
});
