import { useEffect, useState } from "react";
import { db } from "../db/database";
import type { Book, BookStatus } from "../types/book";
import type { Media, MediaStatus, MediaType } from "../types/media";

function intersect(sets: Set<string>[]): Set<string> {
  if (!sets.length) return new Set();
  return new Set(
    [...sets[0]].filter((id) => sets.slice(1).every((set) => set.has(id))),
  );
}

export async function queryBookIdsByIndexes(
  statuses: BookStatus[],
  genres: string[],
): Promise<Set<string> | null> {
  const sets: Set<string>[] = [];
  if (statuses.length)
    sets.push(
      new Set(await db.books.where("status").anyOf(statuses).primaryKeys()),
    );
  if (genres.length)
    sets.push(
      new Set(await db.books.where("genre").anyOf(genres).primaryKeys()),
    );
  return sets.length ? intersect(sets) : null;
}

export async function queryMediaIdsByIndexes(
  type: MediaType,
  statuses: MediaStatus[],
  genres: string[],
): Promise<Set<string>> {
  const sets: Set<string>[] = [
    new Set(await db.media.where("type").equals(type).primaryKeys()),
  ];
  if (statuses.length)
    sets.push(
      new Set(
        await db.media
          .where("[type+status]")
          .anyOf(statuses.map((status) => [type, status]))
          .primaryKeys(),
      ),
    );
  if (genres.length)
    sets.push(
      new Set(
        await db.media
          .where("[type+genre]")
          .anyOf(genres.map((genre) => [type, genre]))
          .primaryKeys(),
      ),
    );
  return intersect(sets);
}

export function useIndexedBookIds(
  books: Book[],
  statuses: BookStatus[],
  genres: string[],
) {
  const [ids, setIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    let active = true;
    void queryBookIdsByIndexes(statuses, genres).then((result) => {
      if (active) setIds(result);
    });
    return () => {
      active = false;
    };
  }, [books, genres, statuses]);
  return ids;
}

export function useIndexedMediaIds(
  media: Media[],
  type: MediaType,
  statuses: MediaStatus[],
  genres: string[],
) {
  const [ids, setIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    let active = true;
    void queryMediaIdsByIndexes(type, statuses, genres).then((result) => {
      if (active) setIds(result);
    });
    return () => {
      active = false;
    };
  }, [genres, media, statuses, type]);
  return ids;
}
