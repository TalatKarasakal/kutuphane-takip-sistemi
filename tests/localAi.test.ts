import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { aiReadiness } from "../src/lib/ai/provider";
import { useSettings } from "../src/store/settingsStore";
import { DEFAULT_SETTINGS } from "../src/types/book";

const require = createRequire(import.meta.url);
const { loopbackOrigin } = require("../electron/ai.cjs") as {
  loopbackOrigin: (raw: unknown) => string | null;
};

afterEach(() => {
  useSettings.setState({ ...DEFAULT_SETTINGS });
  delete (window as { kutuphanem?: unknown }).kutuphanem;
});

describe("yerel model adresi", () => {
  it("yalnız bu makineye işaret eden adresleri kabul eder", () => {
    expect(loopbackOrigin("http://localhost:11434")).toBe(
      "http://localhost:11434",
    );
    expect(loopbackOrigin("http://127.0.0.1:11434")).toBe(
      "http://127.0.0.1:11434",
    );
    expect(loopbackOrigin("http://[::1]:11434")).toBe("http://[::1]:11434");
  });

  it("yolu atarak yalnız kökeni döndürür", () => {
    expect(loopbackOrigin("http://localhost:11434/api/../../admin")).toBe(
      "http://localhost:11434",
    );
  });

  it("makine dışına çıkan ya da bozuk adresleri reddeder", () => {
    for (const raw of [
      "http://example.com:11434",
      "http://192.168.1.10:11434",
      "http://user:pass@localhost:11434",
      "file:///etc/passwd",
      "localhost:11434",
      "",
      null,
    ]) {
      expect(loopbackOrigin(raw)).toBeNull();
    }
  });
});

describe("sağlayıcı hazırlığı", () => {
  it("masaüstü köprüsü yokken hazır saymaz", async () => {
    useSettings.setState({ aiProvider: "local", localAiModel: "qwen3.5:9b" });
    expect((await aiReadiness()).ready).toBe(false);
  });

  it("yerel sağlayıcı çevrimdışı modda da hazırdır", async () => {
    (window as { kutuphanem?: unknown }).kutuphanem = { metadata: {} };
    useSettings.setState({
      aiProvider: "local",
      localAiModel: "qwen3.5:9b",
      networkMode: "offline",
    });
    expect(await aiReadiness()).toEqual({ ready: true, provider: "local" });
  });

  it("model seçilmemişse yerel sağlayıcıyı hazır saymaz", async () => {
    (window as { kutuphanem?: unknown }).kutuphanem = { metadata: {} };
    useSettings.setState({ aiProvider: "local", localAiModel: "   " });
    const readiness = await aiReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.reason).toContain("Yerel model seçilmedi");
  });

  it("Gemini çevrimdışı modda engellenir", async () => {
    (window as { kutuphanem?: unknown }).kutuphanem = { metadata: {} };
    useSettings.setState({ aiProvider: "gemini", networkMode: "offline" });
    const readiness = await aiReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.reason).toContain("Çevrimdışı mod");
  });

  it("anahtar varsa Gemini hazırdır", async () => {
    (window as { kutuphanem?: unknown }).kutuphanem = {
      metadata: {},
      secrets: { status: async () => ({ gemini: true, secure: true }) },
    };
    useSettings.setState({ aiProvider: "gemini" });
    expect(await aiReadiness()).toEqual({ ready: true, provider: "gemini" });
  });
});
