import type { Book } from "../../src/types/book";

export function createBooks(count = 10_000): Book[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `book-${index}`,
    title: `Kitap ${index}`,
    author: index % 3 === 0 ? "Işık Yazar" : `Yazar ${index % 100}`,
    genre: `Tür ${index % 20}`,
    publisher: `Yayınevi ${index % 50}`,
    status: index % 2 === 0 ? "okundu" : "okunacak",
    tagIds: [`tag-${index % 10}`, `tag-${(index + 1) % 10}`],
    addedAt: new Date(2026, 0, 1 + (index % 28)).toISOString(),
    updatedAt: new Date(2026, 0, 1 + (index % 28)).toISOString(),
  }));
}
