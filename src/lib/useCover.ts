import { useEffect, useState } from 'react';

const cache = new Map<string, string | null>();

export function useCover(coverUrl?: string, isbn?: string): string | null {
  const key = coverUrl ?? isbn ?? '';
  const [url, setUrl] = useState<string | null>(() => {
    if (coverUrl) return coverUrl;
    return key ? (cache.get(key) ?? null) : null;
  });

  useEffect(() => {
    if (coverUrl) { setUrl(coverUrl); return; }
    if (!isbn) { setUrl(null); return; }
    if (cache.has(isbn)) { setUrl(cache.get(isbn)!); return; }

    const src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    const img = new Image();
    img.onload = () => { cache.set(isbn, src); setUrl(src); };
    img.onerror = () => { cache.set(isbn, null); setUrl(null); };
    img.src = src;
  }, [coverUrl, isbn]);

  return url;
}
