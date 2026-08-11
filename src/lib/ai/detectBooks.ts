import type {} from "../../types/bridge";
import { assertFileLimit } from "../validation";
import { useSettings } from "../../store/settingsStore";

/** electron/ai.cjs tarafından döndürülen, Google Books ile zenginleştirilmiş kitap adayı. */
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

const MAX_EDGE = 1600;

/** AI köprüsü (Electron preload) mevcut mu? Tarayıcı önizlemesinde olmaz. */
export function isAiBridgeAvailable(): boolean {
  return typeof window !== "undefined" && !!window.kutuphanem?.metadata;
}

export async function hasGeminiSecret(): Promise<boolean> {
  if (!isAiBridgeAvailable()) return false;
  return (await window.kutuphanem!.secrets.status()).gemini;
}

/**
 * Görseli en uzun kenarı MAX_EDGE olacak şekilde küçültüp JPEG base64 döndürür.
 * Token/süre tasarrufu sağlar ve API boyut limitine takılmayı önler.
 */
export async function downscaleImage(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Görsel işlenemedi."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Görsel işlenemedi."));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "Bu görsel açılamadı. iPhone HEIC fotoğraflarını JPG/PNG olarak kaydedip tekrar dene.",
        ),
      );
    };
    img.src = url;
  });

  const comma = dataUrl.indexOf(",");
  return {
    base64: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
    mimeType: "image/jpeg",
  };
}

/** Bir fotoğraftan kitap listesi çıkarır: anahtarı doğrular, görseli küçültür, köprüyü çağırır. */
export async function detectBooksFromImage(
  file: File,
): Promise<DetectBooksResult> {
  if (useSettings.getState().networkMode === "offline") {
    return {
      ok: false,
      error:
        "Çevrimdışı mod açık. Ayarlar’dan isteğe bağlı ağ erişimini etkinleştirin.",
    };
  }
  try {
    assertFileLimit(file, "image");
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Görsel çok büyük.",
    };
  }
  if (!(await hasGeminiSecret())) {
    return {
      ok: false,
      error:
        "Önce Ayarlar → Yapay Zekâ bölümünden ücretsiz Gemini anahtarını ekle.",
    };
  }
  if (!isAiBridgeAvailable()) {
    return {
      ok: false,
      error:
        "Bu özellik masaüstü uygulamasında çalışır (tarayıcı önizlemesinde değil).",
    };
  }

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
