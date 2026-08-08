import type { Book } from "../types/book";
import type { BookDraft } from "./validation";

export function mergeBookDraft(
  target: Book,
  sources: Book[],
  selected: Partial<BookDraft>,
): BookDraft {
  const {
    id: _id,
    addedAt: _addedAt,
    updatedAt: _updatedAt,
    ...targetDraft
  } = target;
  return {
    ...targetDraft,
    ...selected,
    tagIds: [
      ...new Set([target, ...sources].flatMap((book) => book.tagIds ?? [])),
    ],
  };
}
