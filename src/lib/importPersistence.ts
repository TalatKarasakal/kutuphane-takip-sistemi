import { nanoid } from "nanoid";
import { db } from "../db/database";
import type { Book } from "../types/book";
import type { Media } from "../types/media";
import { TAG_COLORS, type Tag } from "../types/library";
import {
  assertRecordLimit,
  normalizeBookDraft,
  normalizeMediaDraft,
  normalizeTag,
  type BookDraft,
  type MediaDraft,
} from "./validation";
import { runInChunks } from "./dbBatch";

export type TaggedBookDraft = BookDraft & { __tagNames?: string[] };
export type TaggedMediaDraft = MediaDraft & { __tagNames?: string[] };

const tagKey = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");

function resolveTags(
  existing: Tag[],
  names: string[],
  now: string,
): { byName: Map<string, Tag>; created: Tag[] } {
  const byName = new Map(existing.map((tag) => [tagKey(tag.name), tag]));
  const created: Tag[] = [];
  for (const rawName of names) {
    const key = tagKey(rawName);
    if (!key || byName.has(key)) continue;
    const tag = normalizeTag({
      id: nanoid(),
      name: rawName,
      color: TAG_COLORS[(existing.length + created.length) % TAG_COLORS.length],
      createdAt: now,
      updatedAt: now,
    });
    byName.set(key, tag);
    created.push(tag);
  }
  return { byName, created };
}

function idsFor(names: string[] | undefined, tags: Map<string, Tag>): string[] {
  return [
    ...new Set(
      (names ?? [])
        .map((name) => tags.get(tagKey(name))?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

export async function persistBookImport(
  rows: TaggedBookDraft[],
): Promise<Book[]> {
  assertRecordLimit(rows.length);
  const prepared = rows.map(({ __tagNames, ...row }) => ({
    draft: normalizeBookDraft(row),
    tagNames: __tagNames,
  }));
  const now = new Date().toISOString();

  return db.transaction("rw", db.tags, db.books, async () => {
    const existing = await db.tags.toArray();
    const { byName, created } = resolveTags(
      existing,
      prepared.flatMap((item) => item.tagNames ?? []),
      now,
    );
    const books = prepared.map(({ draft, tagNames }) => ({
      ...draft,
      tagIds: tagNames?.length ? idsFor(tagNames, byName) : draft.tagIds,
      id: nanoid(),
      addedAt: now,
      updatedAt: now,
    }));
    await runInChunks(created, (chunk) => db.tags.bulkAdd(chunk));
    await runInChunks(books, (chunk) => db.books.bulkAdd(chunk));
    return books;
  });
}

export async function persistMediaImport(
  rows: TaggedMediaDraft[],
): Promise<Media[]> {
  assertRecordLimit(rows.length);
  const prepared = rows.map(({ __tagNames, ...row }) => ({
    draft: normalizeMediaDraft(row),
    tagNames: __tagNames,
  }));
  const now = new Date().toISOString();

  return db.transaction("rw", db.tags, db.media, async () => {
    const existing = await db.tags.toArray();
    const { byName, created } = resolveTags(
      existing,
      prepared.flatMap((item) => item.tagNames ?? []),
      now,
    );
    const media = prepared.map(({ draft, tagNames }) => ({
      ...draft,
      tagIds: tagNames?.length ? idsFor(tagNames, byName) : draft.tagIds,
      id: nanoid(),
      addedAt: now,
      updatedAt: now,
    }));
    await runInChunks(created, (chunk) => db.tags.bulkAdd(chunk));
    await runInChunks(media, (chunk) => db.media.bulkAdd(chunk));
    return media;
  });
}
