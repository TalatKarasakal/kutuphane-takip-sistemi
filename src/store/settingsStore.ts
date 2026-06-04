import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_SETTINGS,
  DEFAULT_BOOK_COLS,
  DEFAULT_FILM_COLS,
  DEFAULT_TV_COLS,
  type AppSettings,
  type ColumnConfig,
} from '../types/book';

interface SettingsState extends AppSettings {
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setColumns: (section: 'book' | 'film' | 'tv', cols: ColumnConfig[]) => void;
  reset: () => void;
}

/**
 * Kayıtlı kolon listesini varsayılanlarla uzlaştırır: kullanıcının sırası/görünürlüğü
 * korunur, varsayılanlarda olup kayıtta olmayan kolonlar sona eklenir, varsayılanlarda
 * artık bulunmayan kolonlar atılır.
 */
function mergeColumns(saved: ColumnConfig[] | undefined, defaults: ColumnConfig[]): ColumnConfig[] {
  const valid = new Set(defaults.map((c) => c.key));
  const kept = (saved ?? []).filter((c) => valid.has(c.key));
  const seen = new Set(kept.map((c) => c.key));
  const missing = defaults.filter((c) => !seen.has(c.key));
  return [...kept, ...missing];
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      setColumns: (section, cols) => {
        const key = section === 'book' ? 'bookColumns' : section === 'film' ? 'filmColumns' : 'tvColumns';
        set({ [key]: cols } as Partial<SettingsState>);
      },
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'kutuphanem-settings',
      version: 1,
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<AppSettings>;
        return {
          ...DEFAULT_SETTINGS,
          ...s,
          bookColumns: mergeColumns(s.bookColumns, DEFAULT_BOOK_COLS),
          filmColumns: mergeColumns(s.filmColumns, DEFAULT_FILM_COLS),
          tvColumns: mergeColumns(s.tvColumns, DEFAULT_TV_COLS),
        } as SettingsState;
      },
    },
  ),
);
