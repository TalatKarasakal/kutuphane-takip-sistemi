import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, type AppSettings, type ColumnConfig } from '../types/book';

interface SettingsState extends AppSettings {
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setColumns: (section: 'book' | 'film' | 'tv', cols: ColumnConfig[]) => void;
  reset: () => void;
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
    { name: 'kutuphanem-settings' },
  ),
);
