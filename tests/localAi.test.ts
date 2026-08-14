import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { aiReadiness } from "../src/lib/ai/provider";
import { useSettings } from "../src/store/settingsStore";
import { DEFAULT_SETTINGS } from "../src/types/book";

const require = createRequire(import.meta.url);
const { loopbackOrigin, registerAiIpc } = require("../electron/ai.cjs") as {
  loopbackOrigin: (raw: unknown) => string | null;
  registerAiIpc: (deps: {
    handle: (channel: string, fn: (payload: unknown) => unknown) => void;
    getApiKey: () => string;
  }) => void;
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

/** Kayıtlı IPC işleyicilerini toplayıp `ai:detectBooks`i doğrudan çağırır. */
function detectBooksHandler() {
  const handlers = new Map<string, (payload: unknown) => unknown>();
  registerAiIpc({
    handle: (channel, fn) => handlers.set(channel, fn),
    getApiKey: () => "",
  });
  return handlers.get("ai:detectBooks")!;
}

/** Ollama'yı taklit eder; /api/show yeteneği ve /api/chat yanıtı ayarlanabilir. */
function fakeOllama({
  capabilities,
  message,
}: {
  capabilities: string[];
  message: Record<string, string>;
}) {
  const chatBodies: Record<string, unknown>[] = [];
  const fetchMock = vi.fn(async (url: string, init?: { body?: string }) => {
    if (String(url).endsWith("/api/show"))
      return new Response(JSON.stringify({ capabilities }), { status: 200 });
    chatBodies.push(JSON.parse(init?.body ?? "{}"));
    return new Response(JSON.stringify({ message }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { chatBodies };
}

const localPayload = (localModel: string) => ({
  provider: "local",
  localUrl: "http://127.0.0.1:11434",
  localModel,
  // Ağ zenginleştirmesi bu testin konusu değil; atlanması için kapatılır.
  allowNetwork: false,
  imageBase64: "AAAA",
  mimeType: "image/jpeg",
});

describe("yerel model isteği", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("bağlamı büyütür ve düşünmeyi destekleyen modelde kapatır", async () => {
    const { chatBodies } = fakeOllama({
      capabilities: ["vision", "thinking"],
      message: { content: JSON.stringify({ items: [{ title: "Devlet" }] }) },
    });

    const result = (await detectBooksHandler()(
      localPayload("dusunen-model"),
    )) as { ok: boolean; books: { title: string }[] };

    expect(result.ok).toBe(true);
    expect(result.books.map((b) => b.title)).toEqual(["Devlet"]);
    // Ollama varsayılanı (4096) raf fotoğrafına yetmiyordu; taşınca yanıt boş dönüyordu.
    expect(chatBodies[0].options).toMatchObject({ num_ctx: 8192 });
    expect(chatBodies[0].think).toBe(false);
  });

  it("düşünmeyi desteklemeyen modele think alanı göndermez", async () => {
    const { chatBodies } = fakeOllama({
      capabilities: ["vision"],
      message: { content: JSON.stringify({ items: [{ title: "Hamlet" }] }) },
    });

    await detectBooksHandler()(localPayload("dusunmeyen-model"));

    expect(chatBodies[0]).not.toHaveProperty("think");
  });

  it("yanıtı thinking alanına yazan modeli de çözümler", async () => {
    fakeOllama({
      capabilities: ["vision", "thinking"],
      message: {
        content: "",
        thinking: JSON.stringify({ items: [{ title: "Odysseia" }] }),
      },
    });

    const result = (await detectBooksHandler()(
      localPayload("thinking-yazan-model"),
    )) as { ok: boolean; books: { title: string }[] };

    expect(result.ok).toBe(true);
    expect(result.books.map((b) => b.title)).toEqual(["Odysseia"]);
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
