import { useEffect, useState } from "react";
import { db } from "../db/database";
import { useSettings } from "../store/settingsStore";
import type { ArtworkOwnerType } from "../types/library";
import { runInChunks } from "./dbBatch";

const MAX_CACHE_BYTES = 250 * 1024 * 1024;

async function pruneArtworkCache(): Promise<void> {
  const items = await db.artworkCache.orderBy("lastAccessedAt").toArray();
  let total = items.reduce((sum, item) => sum + item.size, 0);
  const remove: string[] = [];
  for (const item of items) {
    if (total <= MAX_CACHE_BYTES) break;
    total -= item.size;
    remove.push(item.key);
  }
  if (remove.length)
    await db.transaction("rw", db.artworkCache, () =>
      runInChunks(remove, (chunk) => db.artworkCache.bulkDelete(chunk)),
    );
}

export function useArtwork(
  ownerType: ArtworkOwnerType,
  ownerId: string,
  sourceUrl?: string,
): { url: string | null; loading: boolean } {
  const networkMode = useSettings((state) => state.networkMode);
  const remoteArtwork = useSettings((state) => state.remoteArtwork);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    const key = `${ownerType}:${ownerId}`;
    const load = async () => {
      const cached = await db.artworkCache.get(key);
      if (cached && (!sourceUrl || cached.sourceUrl === sourceUrl)) {
        objectUrl = URL.createObjectURL(cached.blob);
        if (!cancelled) setUrl(objectUrl);
        void db.artworkCache.update(key, {
          lastAccessedAt: new Date().toISOString(),
        });
        return;
      }
      if (cached) await db.artworkCache.delete(key);
      if (
        !sourceUrl ||
        networkMode === "offline" ||
        !remoteArtwork ||
        !window.kutuphanem
      ) {
        if (!cancelled) setUrl(null);
        return;
      }
      if (!cancelled) setLoading(true);
      const result = await window.kutuphanem.artwork.fetch(sourceUrl);
      if (!result.ok || !result.bytes || !result.mimeType) {
        if (!cancelled) setLoading(false);
        return;
      }
      const bytes = new Uint8Array(result.bytes);
      const blob = new Blob([bytes], { type: result.mimeType });
      const now = new Date().toISOString();
      await db.artworkCache.put({
        key,
        ownerType,
        ownerId,
        sourceUrl,
        blob,
        mimeType: result.mimeType,
        size: blob.size,
        lastAccessedAt: now,
        updatedAt: now,
      });
      await pruneArtworkCache();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) {
        setUrl(objectUrl);
        setLoading(false);
      }
    };
    void load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [networkMode, ownerId, ownerType, remoteArtwork, sourceUrl]);

  return { url, loading };
}
