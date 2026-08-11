import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import {
  normalizeMediaDraft,
  validationMessage,
  type MediaDraft,
} from "../lib/validation";
import { runInChunks } from "../lib/dbBatch";
import { useToast } from "./toastStore";
import type { Media, MediaStatus, MediaType } from "../types/media";
import type { TagFilterMode } from "../types/library";

export type MediaSortKey =
  | "addedAt"
  | "title"
  | "director"
  | "genre"
  | "releaseYear"
  | "watchYear"
  | "status"
  | "duration"
  | "seasons"
  | "episodeDuration";
export type SortDir = "asc" | "desc";

export interface MediaFilters {
  search: string;
  statusFilter: MediaStatus[];
  genreFilter: string[];
  tagFilter: string[];
  tagFilterMode: TagFilterMode;
  groupByTags: boolean;
  sortKey: MediaSortKey;
  sortDir: SortDir;
}

interface MediaState {
  loaded: boolean;
  loading: boolean;
  error?: string;
  media: Media[];
  filters: Record<MediaType, MediaFilters>;
  selectedIds: Set<string>;

  load: () => Promise<void>;
  add: (media: MediaDraft) => Promise<Media>;
  addMany: (items: MediaDraft[]) => Promise<Media[]>;
  update: (id: string, patch: Partial<MediaDraft>) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStatus: (ids: string[], status: MediaStatus) => Promise<void>;
  setTags: (ids: string[], tagIds: string[]) => Promise<void>;

  setSearch: (type: MediaType, value: string) => void;
  toggleStatusFilter: (type: MediaType, status: MediaStatus) => void;
  toggleGenreFilter: (type: MediaType, genre: string) => void;
  toggleTagFilter: (type: MediaType, tagId: string) => void;
  setTagFilterMode: (type: MediaType, mode: TagFilterMode) => void;
  toggleGroupByTags: (type: MediaType) => void;
  clearFilters: (type?: MediaType) => void;
  setSort: (type: MediaType, key: MediaSortKey, direction?: SortDir) => void;

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

const emptyFilters = (): MediaFilters => ({
  search: "",
  statusFilter: [],
  genreFilter: [],
  tagFilter: [],
  tagFilterMode: "or",
  groupByTags: false,
  sortKey: "addedAt",
  sortDir: "desc",
});

function draftFromMedia(item: Media): MediaDraft {
  const { id: _id, addedAt: _addedAt, updatedAt: _updatedAt, ...draft } = item;
  return draft;
}

function showFailure(prefix: string, error: unknown): never {
  useToast.getState().show(`${prefix}: ${validationMessage(error)}`, "error");
  throw error;
}

export const useMedia = create<MediaState>((set, get) => ({
  loaded: false,
  loading: false,
  error: undefined,
  media: [],
  filters: { film: emptyFilters(), dizi: emptyFilters() },
  selectedIds: new Set(),

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ media: await db.media.toArray(), loaded: true, loading: false });
    } catch (error) {
      set({ loading: false, error: validationMessage(error) });
      showFailure("Film ve diziler yüklenemedi", error);
    }
  },

  add: async (input) => {
    try {
      const draft = normalizeMediaDraft(input);
      const now = new Date().toISOString();
      const item: Media = {
        ...draft,
        id: nanoid(),
        addedAt: now,
        updatedAt: now,
      };
      await db.media.add(item);
      set({ media: [...get().media, item] });
      useToast.getState().show(`"${item.title}" eklendi`);
      return item;
    } catch (error) {
      return showFailure("Kayıt eklenemedi", error);
    }
  },

  addMany: async (items) => {
    try {
      const normalized = items.map((item) => normalizeMediaDraft(item));
      const now = new Date().toISOString();
      const rows: Media[] = normalized.map((item) => ({
        ...item,
        id: nanoid(),
        addedAt: now,
        updatedAt: now,
      }));
      await db.transaction("rw", db.media, async () => {
        await runInChunks(rows, (chunk) => db.media.bulkAdd(chunk));
      });
      set({ media: [...get().media, ...rows] });
      useToast.getState().show(`${rows.length} öğe içe aktarıldı`);
      return rows;
    } catch (error) {
      return showFailure("Kayıtlar içe aktarılamadı", error);
    }
  },

  update: async (id, patch) => {
    const current = get().media.find((item) => item.id === id);
    if (!current) return;
    try {
      const draft = normalizeMediaDraft({
        ...draftFromMedia(current),
        ...patch,
      });
      const next: Media = {
        ...current,
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      await db.media.put(next);
      set({ media: get().media.map((item) => (item.id === id ? next : item)) });
      useToast.getState().show(`"${next.title}" güncellendi`);
    } catch (error) {
      showFailure("Kayıt güncellenemedi", error);
    }
  },

  remove: async (ids) => {
    const idSet = new Set(ids);
    const deleted = get().media.filter((item) => idSet.has(item.id));
    const artwork = (
      await Promise.all(
        ids.map((id) =>
          db.artworkCache
            .where("[ownerType+ownerId]")
            .equals(["media", id])
            .toArray(),
        ),
      )
    ).flat();
    try {
      await db.transaction("rw", db.media, db.artworkCache, async () => {
        await runInChunks(ids, (chunk) => db.media.bulkDelete(chunk));
        if (artwork.length)
          await runInChunks(
            artwork.map((item) => item.key),
            (chunk) => db.artworkCache.bulkDelete(chunk),
          );
      });
      set({
        media: get().media.filter((item) => !idSet.has(item.id)),
        selectedIds: new Set(
          [...get().selectedIds].filter((id) => !idSet.has(id)),
        ),
      });
      useToast
        .getState()
        .show(`${ids.length} öğe silindi`, "success", async () => {
          await db.transaction("rw", db.media, db.artworkCache, async () => {
            if (deleted.length)
              await runInChunks(deleted, (chunk) => db.media.bulkPut(chunk));
            if (artwork.length)
              await runInChunks(artwork, (chunk) =>
                db.artworkCache.bulkPut(chunk),
              );
          });
          set({ media: [...get().media, ...deleted] });
        });
    } catch (error) {
      showFailure("Kayıtlar silinemedi", error);
    }
  },

  setStatus: async (ids, status) => {
    try {
      const now = new Date().toISOString();
      await db.transaction("rw", db.media, async () => {
        await runInChunks(ids, (chunk) =>
          Promise.all(
            chunk.map((id) => db.media.update(id, { status, updatedAt: now })),
          ),
        );
      });
      const idSet = new Set(ids);
      set({
        media: get().media.map((item) =>
          idSet.has(item.id) ? { ...item, status, updatedAt: now } : item,
        ),
      });
      useToast.getState().show(`${ids.length} kaydın durumu güncellendi`);
    } catch (error) {
      showFailure("Durum güncellenemedi", error);
    }
  },

  setTags: async (ids, tagIds) => {
    try {
      const now = new Date().toISOString();
      const unique = [...new Set(tagIds)];
      await db.transaction("rw", db.media, async () => {
        await runInChunks(ids, (chunk) =>
          Promise.all(
            chunk.map((id) =>
              db.media.update(id, { tagIds: unique, updatedAt: now }),
            ),
          ),
        );
      });
      const idSet = new Set(ids);
      set({
        media: get().media.map((item) =>
          idSet.has(item.id)
            ? { ...item, tagIds: unique, updatedAt: now }
            : item,
        ),
      });
      useToast.getState().show(`${ids.length} kaydın etiketleri güncellendi`);
    } catch (error) {
      showFailure("Etiketler güncellenemedi", error);
    }
  },

  setSearch: (type, search) =>
    set({
      filters: { ...get().filters, [type]: { ...get().filters[type], search } },
    }),
  toggleStatusFilter: (type, status) => {
    const current = get().filters[type].statusFilter;
    const statusFilter = current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status];
    set({
      filters: {
        ...get().filters,
        [type]: { ...get().filters[type], statusFilter },
      },
    });
  },
  toggleGenreFilter: (type, genre) => {
    const current = get().filters[type].genreFilter;
    const genreFilter = current.includes(genre)
      ? current.filter((item) => item !== genre)
      : [...current, genre];
    set({
      filters: {
        ...get().filters,
        [type]: { ...get().filters[type], genreFilter },
      },
    });
  },
  toggleTagFilter: (type, tagId) => {
    const current = get().filters[type].tagFilter;
    const tagFilter = current.includes(tagId)
      ? current.filter((item) => item !== tagId)
      : [...current, tagId];
    set({
      filters: {
        ...get().filters,
        [type]: { ...get().filters[type], tagFilter },
      },
    });
  },
  setTagFilterMode: (type, tagFilterMode) =>
    set({
      filters: {
        ...get().filters,
        [type]: { ...get().filters[type], tagFilterMode },
      },
    }),
  toggleGroupByTags: (type) =>
    set({
      filters: {
        ...get().filters,
        [type]: {
          ...get().filters[type],
          groupByTags: !get().filters[type].groupByTags,
        },
      },
    }),
  clearFilters: (type) =>
    set({
      filters: type
        ? { ...get().filters, [type]: emptyFilters() }
        : { film: emptyFilters(), dizi: emptyFilters() },
    }),
  setSort: (type, sortKey, sortDir) => {
    const current = get().filters[type];
    set({
      filters: {
        ...get().filters,
        [type]: {
          ...current,
          sortKey,
          sortDir:
            sortDir ??
            (current.sortKey === sortKey && current.sortDir === "asc"
              ? "desc"
              : "asc"),
        },
      },
    });
  },

  toggleSelect: (id) => {
    const selectedIds = new Set(get().selectedIds);
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    set({ selectedIds });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
}));

export function applyMediaFilters(
  items: Media[],
  type: MediaType,
  options: MediaFilters,
): Media[] {
  let result = items.filter((item) => item.type === type);
  const search = options.search.trim().toLocaleLowerCase("tr");
  if (search) {
    result = result.filter((item) =>
      [item.title, item.director, item.genre, item.notes]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(search),
    );
  }
  if (options.statusFilter.length)
    result = result.filter((item) =>
      options.statusFilter.includes(item.status),
    );
  if (options.genreFilter.length)
    result = result.filter(
      (item) => item.genre != null && options.genreFilter.includes(item.genre),
    );
  if (options.tagFilter.length) {
    result = result.filter((item) => {
      const ids = item.tagIds ?? [];
      return options.tagFilterMode === "and"
        ? options.tagFilter.every((id) => ids.includes(id))
        : options.tagFilter.some((id) => ids.includes(id));
    });
  }
  const direction = options.sortDir === "asc" ? 1 : -1;
  return [...result].sort((a, b) => {
    const aValue = a[options.sortKey];
    const bValue = b[options.sortKey];
    if ((aValue == null || aValue === "") && (bValue == null || bValue === ""))
      return 0;
    if (aValue == null || aValue === "") return 1;
    if (bValue == null || bValue === "") return -1;
    if (typeof aValue === "number" && typeof bValue === "number")
      return (aValue - bValue) * direction;
    return String(aValue).localeCompare(String(bValue), "tr") * direction;
  });
}
