import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import { normalizeTag, validationMessage } from "../lib/validation";
import { TAG_COLORS, type Tag } from "../types/library";
import { useToast } from "./toastStore";
import { useBooks } from "./booksStore";
import { useMedia } from "./mediaStore";

interface TagsState {
  loaded: boolean;
  tags: Tag[];
  load: () => Promise<void>;
  add: (name: string, color?: string) => Promise<Tag>;
  addMany: (names: string[]) => Promise<Tag[]>;
  update: (
    id: string,
    patch: Pick<Partial<Tag>, "name" | "color">,
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const sortTags = (tags: Tag[]) =>
  [...tags].sort((a, b) => a.name.localeCompare(b.name, "tr"));

export const useTags = create<TagsState>((set, get) => ({
  loaded: false,
  tags: [],
  load: async () => {
    try {
      set({ tags: sortTags(await db.tags.toArray()), loaded: true });
    } catch (error) {
      useToast
        .getState()
        .show(`Etiketler yüklenemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
  add: async (name, color) => {
    const now = new Date().toISOString();
    const tag = normalizeTag({
      id: nanoid(),
      name,
      color: color ?? TAG_COLORS[get().tags.length % TAG_COLORS.length],
      createdAt: now,
      updatedAt: now,
    });
    const duplicate = get().tags.find(
      (item) =>
        item.name.toLocaleLowerCase("tr") === tag.name.toLocaleLowerCase("tr"),
    );
    if (duplicate) return duplicate;
    try {
      await db.tags.add(tag);
      set({ tags: sortTags([...get().tags, tag]) });
      return tag;
    } catch (error) {
      useToast
        .getState()
        .show(`Etiket eklenemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
  addMany: async (names) => {
    const uniqueNames = [
      ...new Map(
        names
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLocaleLowerCase("tr"), name]),
      ).entries(),
    ];
    const known = new Map(
      get().tags.map((tag) => [tag.name.toLocaleLowerCase("tr"), tag]),
    );
    const now = new Date().toISOString();
    const created = uniqueNames
      .filter(([key]) => !known.has(key))
      .map(([key, name], index) => {
        const tag = normalizeTag({
          id: nanoid(),
          name,
          color: TAG_COLORS[(get().tags.length + index) % TAG_COLORS.length],
          createdAt: now,
          updatedAt: now,
        });
        known.set(key, tag);
        return tag;
      });
    try {
      await db.transaction("rw", db.tags, async () => {
        for (let offset = 0; offset < created.length; offset += 500) {
          await db.tags.bulkAdd(created.slice(offset, offset + 500));
        }
      });
      if (created.length) set({ tags: sortTags([...get().tags, ...created]) });
      return uniqueNames.map(([key]) => known.get(key)!);
    } catch (error) {
      useToast
        .getState()
        .show(`Etiketler eklenemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
  update: async (id, patch) => {
    const current = get().tags.find((tag) => tag.id === id);
    if (!current) return;
    const next = normalizeTag({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    try {
      await db.tags.put(next);
      set({
        tags: sortTags(get().tags.map((tag) => (tag.id === id ? next : tag))),
      });
    } catch (error) {
      useToast
        .getState()
        .show(`Etiket güncellenemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
  remove: async (id) => {
    try {
      await db.transaction("rw", db.tags, db.books, db.media, async () => {
        await db.tags.delete(id);
        await db.books.toCollection().modify((book) => {
          if (book.tagIds?.includes(id))
            book.tagIds = book.tagIds.filter((tagId) => tagId !== id);
        });
        await db.media.toCollection().modify((item) => {
          if (item.tagIds?.includes(id))
            item.tagIds = item.tagIds.filter((tagId) => tagId !== id);
        });
      });
      set({ tags: get().tags.filter((tag) => tag.id !== id) });
      await Promise.all([
        useBooks.getState().load(),
        useMedia.getState().load(),
      ]);
    } catch (error) {
      useToast
        .getState()
        .show(`Etiket silinemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
}));
