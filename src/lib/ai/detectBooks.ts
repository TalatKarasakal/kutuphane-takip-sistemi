import type {} from "../../types/bridge";
import { assertFileLimit } from "../validation";
import { aiReadiness, aiRequestBase, downscaleImage } from "./provider";

/** electron/ai.cjs tarafından döndürülen, künyesi tamamlanmış kitap adayı. */
export interface DetectedBook {
  title: string;
  author: string;
  confidence?: number;
  publisher?: string;
  pageCount?: number;
  publicationYear?: number;
  isbn?: string;
  coverUrl?: string;
  genre?: string;
  language?: string;
  /** Google Books'ta eşleşme bulunduysa true (künye zenginleştirildi). */
  matched?: boolean;
}

export interface DetectBooksPayload {
  imageBase64: string;
  mimeType: string;
}

export type DetectBooksResult =
  { ok: true; books: DetectedBook[] } | { ok: false; error: string };

/** Bir fotoğraftan kitap listesi çıkarır: sağlayıcıyı doğrular, görseli küçültür, köprüyü çağırır. */
export async function detectBooksFromImage(
  file: File,
): Promise<DetectBooksResult> {
  try {
    assertFileLimit(file, "image");
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Görsel çok büyük.",
    };
  }

  const readiness = await aiReadiness();
  if (!readiness.ready)
    return { ok: false, error: readiness.reason ?? "Yapay zekâ hazır değil." };

  let img: { base64: string; mimeType: string };
  try {
    img = await downscaleImage(file);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Görsel işlenemedi.",
    };
  }

  try {
    return await window.kutuphanem!.metadata.detectBooks({
      ...aiRequestBase(),
      imageBase64: img.base64,
      mimeType: img.mimeType,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.",
    };
  }
}
