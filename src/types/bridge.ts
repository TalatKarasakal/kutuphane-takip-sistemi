import type { DetectedBook, DetectBooksResult } from "../lib/ai/detectBooks";

export interface BackupFileInfo {
  name: string;
  path: string;
  size: number;
  mtime: number;
}

export interface IsbnLookupResult {
  ok: boolean;
  books?: DetectedBook[];
  error?: string;
}

export interface AppBridge {
  backup: {
    write: (
      json: string,
    ) => Promise<{ ok: boolean; path?: string; error?: string }>;
    list: () => Promise<BackupFileInfo[]>;
    read: (path: string) => Promise<string | null>;
    reveal: () => Promise<boolean>;
  };
  secrets: {
    status: () => Promise<{ gemini: boolean; secure: boolean }>;
    setGemini: (value: string) => Promise<{ ok: boolean; error?: string }>;
    clearGemini: () => Promise<{ ok: boolean; error?: string }>;
  };
  metadata: {
    lookupIsbn: (isbn: string) => Promise<IsbnLookupResult>;
    detectBooks: (payload: {
      imageBase64: string;
      mimeType: string;
    }) => Promise<DetectBooksResult>;
  };
  artwork: {
    fetch: (url: string) => Promise<{
      ok: boolean;
      bytes?: Uint8Array;
      mimeType?: string;
      error?: string;
    }>;
  };
  theme: {
    set: (theme: "light" | "dark" | "system") => Promise<boolean>;
    onChange: (callback: (theme: "light" | "dark") => void) => () => void;
  };
  appInfo: {
    get: () => Promise<{ version: string; name: string }>;
    checkUpdate: () => Promise<{
      ok: boolean;
      current?: string;
      latest?: string;
      url?: string;
      updateAvailable?: boolean;
      error?: string;
    }>;
    openExternal: (url: string) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    kutuphanem?: AppBridge;
  }
}

export {};
