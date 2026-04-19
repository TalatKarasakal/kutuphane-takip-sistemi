import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db } from '../db/database';
import type { Media, MediaStatus, MediaType } from '../types/media';

export type MediaSortKey = 'addedAt' | 'title' | 'director' | 'releaseYear' | 'watchYear' | 'status';
export type SortDir = 'asc' | 'desc';

interface MediaState {
  loaded: boolean;
  media: Media[];
  search: string;
  statusFilter: MediaStatus[];
  sortKey: MediaSortKey;
  sortDir: SortDir;
  selectedIds: Set<string>;

  load: () => Promise<void>;
  add: (m: Omit<Media, 'id' | 'addedAt' | 'updatedAt'>) => Promise<Media>;
  update: (id: string, patch: Partial<Media>) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStatus: (ids: string[], status: MediaStatus) => Promise<void>;

  setSearch: (v: string) => void;
  toggleStatusFilter: (s: MediaStatus) => void;
  clearFilters: () => void;
  setSort: (key: MediaSortKey, dir?: SortDir) => void;

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export const useMedia = create<MediaState>((set, get) => ({
  loaded: false,
  media: [],
  search: '',
  statusFilter: [],
  sortKey: 'addedAt',
  sortDir: 'desc',
  selectedIds: new Set(),

  load: async () => {
    const media = await db.media.toArray();
    set({ media, loaded: true });
  },

  add: async (m) => {
    const now = new Date().toISOString();
    const item: Media = { ...m, id: nanoid(), addedAt: now, updatedAt: now };
    await db.media.add(item);
    set({ media: [...get().media, item] });
    return item;
  },

  update: async (id, patch) => {
    const updated: Partial<Media> = { ...patch, updatedAt: new Date().toISOString() };
    await db.media.update(id, updated);
    set({
      media: get().media.map((m) => (m.id === id ? { ...m, ...updated } as Media : m)),
    });
  },

  remove: async (ids) => {
    await db.media.bulkDelete(ids);
    const set0 = new Set(ids);
    set({
      media: get().media.filter((m) => !set0.has(m.id)),
      selectedIds: new Set([...get().selectedIds].filter((x) => !set0.has(x))),
    });
  },

  setStatus: async (ids, status) => {
    const now = new Date().toISOString();
    await db.transaction('rw', db.media, async () => {
      await Promise.all(ids.map((id) => db.media.update(id, { status, updatedAt: now })));
    });
    const set0 = new Set(ids);
    set({
      media: get().media.map((m) => (set0.has(m.id) ? { ...m, status, updatedAt: now } : m)),
    });
  },

  setSearch: (v) => set({ search: v }),
  toggleStatusFilter: (s) => {
    const cur = get().statusFilter;
    set({ statusFilter: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] });
  },
  clearFilters: () => set({ statusFilter: [], search: '' }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir ?? (get().sortKey === key && get().sortDir === 'asc' ? 'desc' : 'asc') }),

  toggleSelect: (id) => {
    const s = new Set(get().selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    set({ selectedIds: s });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
}));

export function applyMediaFilters(
  items: Media[],
  type: MediaType,
  opts: { search: string; statusFilter: MediaStatus[]; sortKey: MediaSortKey; sortDir: SortDir },
): Media[] {
  let result = items.filter((m) => m.type === type);

  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.director ?? '').toLowerCase().includes(q) ||
        (m.notes ?? '').toLowerCase().includes(q),
    );
  }

  if (opts.statusFilter.length > 0) {
    result = result.filter((m) => opts.statusFilter.includes(m.status));
  }

  result.sort((a, b) => {
    const dir = opts.sortDir === 'asc' ? 1 : -1;
    const k = opts.sortKey;
    const av = a[k] ?? '';
    const bv = b[k] ?? '';
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv, 'tr') * dir;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  return result;
}
