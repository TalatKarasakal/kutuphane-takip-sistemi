import type {} from "../../types/bridge";
import { assertFileLimit } from "../validation";
import { aiReadiness, aiRequestBase, downscaleImage } from "./provider";
import type { MediaType } from "../../types/media";

/** electron/ai.cjs tarafından döndürülen film/dizi adayı. */
export interface DetectedMedia {
  title: string;
  type: MediaType;
  director?: string;
  genre?: string;
  releaseYear?: number;
  duration?: number;
  seasons?: number;
  episodeDuration?: number;
  confidence?: number;
}

export type DetectMediaResult =
  { ok: true; items: DetectedMedia[] } | { ok: false; error: string };

/**
 * Bir fotoğraftan film/dizi listesi çıkarır. Kitaplardan farkı, künyenin
 * ayrı bir katalog servisinden değil doğrudan modelden gelmesidir; ücretsiz
 * ve anahtarsız bir film katalog API'si bulunmadığı için alanlar modelin
 * bilgisiyle doldurulur ve kullanıcı onayından geçer.
 */
export async function detectMediaFromImage(
  file: File,
  type: MediaType,
): Promise<DetectMediaResult> {
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
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Görsel işlenemedi.",
    };
  }

  try {
    return await window.kutuphanem!.metadata.detectMedia({
      ...aiRequestBase(),
      imageBase64: img.base64,
      mimeType: img.mimeType,
      type,
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
    };
  }
}
