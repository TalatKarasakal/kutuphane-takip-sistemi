import type {} from "../../types/bridge";
import { useSettings } from "../../store/settingsStore";
import type { AiProvider } from "../../types/book";

const MAX_EDGE = 1600;

/** AI köprüsü (Electron preload) mevcut mu? Tarayıcı önizlemesinde olmaz. */
export function isAiBridgeAvailable(): boolean {
  return typeof window !== "undefined" && !!window.kutuphanem?.metadata;
}

export async function hasGeminiSecret(): Promise<boolean> {
  if (!isAiBridgeAvailable()) return false;
  return (await window.kutuphanem!.secrets.status()).gemini;
}

/** Her algılama isteğine eklenen sağlayıcı bağlamı. */
export interface AiRequestBase {
  provider: AiProvider;
  localUrl: string;
  localModel: string;
  /** Çevrimdışı modda ağ gerektiren adımlar (künye zenginleştirme) atlanır. */
  allowNetwork: boolean;
}

export function aiRequestBase(): AiRequestBase {
  const { aiProvider, localAiUrl, localAiModel, networkMode } =
    useSettings.getState();
  return {
    provider: aiProvider,
    localUrl: localAiUrl,
    localModel: localAiModel,
    allowNetwork: networkMode !== "offline",
  };
}

export interface AiReadiness {
  ready: boolean;
  provider: AiProvider;
  reason?: string;
}

/**
 * Seçili sağlayıcının kullanılabilir olup olmadığını söyler. Yerel sağlayıcı
 * çevrimdışı modda da çalışır; istek bu bilgisayardan dışarı çıkmaz.
 */
export async function aiReadiness(): Promise<AiReadiness> {
  const { aiProvider, localAiModel, networkMode } = useSettings.getState();
  if (!isAiBridgeAvailable()) {
    return {
      ready: false,
      provider: aiProvider,
      reason:
        "Bu özellik masaüstü uygulamasında çalışır (tarayıcı önizlemesinde değil).",
    };
  }
  if (aiProvider === "local") {
    return localAiModel.trim()
      ? { ready: true, provider: "local" }
      : {
          ready: false,
          provider: "local",
          reason:
            "Yerel model seçilmedi. Ayarlar → Yapay Zekâ bölümünden kurulu bir görsel modeli seç.",
        };
  }
  if (networkMode === "offline") {
    return {
      ready: false,
      provider: "gemini",
      reason:
        "Çevrimdışı mod açık. Ayarlar’dan isteğe bağlı ağ erişimini etkinleştir ya da yerel modele geç.",
    };
  }
  return (await hasGeminiSecret())
    ? { ready: true, provider: "gemini" }
    : {
        ready: false,
        provider: "gemini",
        reason:
          "Önce Ayarlar → Yapay Zekâ bölümünden ücretsiz Gemini anahtarını ekle.",
      };
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
