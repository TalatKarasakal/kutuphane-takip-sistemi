// ---- Gemini ----------------------------------------------------------------

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

const DETECT_PROMPT = [
  "Bu fotoğrafta görünen kitapları tanımla.",
  "Kitap sırtı veya kapağı kısmen görünse bile, okuyabildiğin tüm kitapları listele.",
  "Her kitap için başlık (title) ver; yazar (author) okunabiliyorsa ekle, okunamıyorsa boş bırak.",
  "Türkçe kitap ve yazar adlarını olduğu gibi, Türkçe karakterleriyle koru.",
  "Emin olmadığın kitapları da düşük confidence (0 ile 1 arası) ile ekle.",
  "Yalnızca gerçek kitapları dahil et; dekoratif nesne, dergi veya kutuları atla.",
  "Aynı kitabı iki kez yazma.",
].join(" ");

/**
 * Yerel modeller için ayrı istem. Küçük modeller "kitabı tanı" gibi bilgiye
 * dayanan yönergelerde uydurmaya kayıyor; sırttaki metni okumaya odaklanan bu
 * sürüm ölçümde uydurmayı sıfırlayıp isabeti belirgin biçimde artırdı.
 */
const LOCAL_DETECT_PROMPT = [
  "Bu fotoğraftaki kitapları, üzerlerinde YAZAN metni okuyarak listele.",
  "Raf ya da yığın fotoğrafıysa her kitap sırtını sırayla tek tek oku; tek bir kapak fotoğrafıysa yalnız o kitabı yaz.",
  "Sırtta/kapakta yazan eser adını title, yazar adını author alanına yaz.",
  "Yalnızca gerçekten okuyabildiğin metni yaz; tahmin etme, uydurma, tamamlama yapma.",
  "Türkçe harfleri (ç ğ ı İ ö ş ü â) olduğu gibi koru.",
  "Yayınevi adı, seri adı (örn. Klasikler Dizisi) ve cilt/roma numaraları başlık değildir; bunları atla.",
].join(" ");

const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      author: { type: "STRING" },
      confidence: { type: "NUMBER" },
    },
    required: ["title"],
  },
};

const MEDIA_LABEL = { film: "film", dizi: "dizi" };

const mediaDetectPrompt = (kind) =>
  [
    `Bu fotoğrafta görünen ${MEDIA_LABEL[kind]} yapımlarını tanımla.`,
    "Afiş, DVD/Blu-ray kapağı, kutu sırtı, ekran görüntüsü ya da yayın platformu listesi olabilir.",
    "Kısmen görünen kapakları da, okuyabildiğin kadarıyla listele.",
    "Türkçe adları Türkçe karakterleriyle koru; yalnızca Türkçe afişte görünen ad varsa onu kullan.",
    kind === "film"
      ? "Yalnızca sinema filmlerini dahil et; dizileri atla."
      : "Yalnızca dizileri dahil et; sinema filmlerini atla.",
    "Her yapım için bildiğin künyeyi doldur: yönetmen (director), tür (genre), çıkış yılı (releaseYear).",
    kind === "film"
      ? "Filmin dakika cinsinden süresini (duration) biliyorsan ekle."
      : "Dizinin sezon sayısını (seasons) ve ortalama bölüm süresini (episodeDuration, dakika) biliyorsan ekle.",
    "Emin olmadığın alanları boş bırak; uydurma.",
    "Emin olmadığın yapımları da düşük confidence (0 ile 1 arası) ile ekle.",
    "Aynı yapımı iki kez yazma.",
  ].join(" ");

const MEDIA_RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      director: { type: "STRING" },
      genre: { type: "STRING" },
      releaseYear: { type: "NUMBER" },
      duration: { type: "NUMBER" },
      seasons: { type: "NUMBER" },
      episodeDuration: { type: "NUMBER" },
      confidence: { type: "NUMBER" },
    },
    required: ["title"],
  },
};

// ---- Yerel model (Ollama) ---------------------------------------------------

/**
 * Ollama, Gemini'nin büyük harfli şema lehçesini değil standart JSON Schema
 * bekler. Ayrıca küçük modeller kök seviyede diziden çok nesne üretmekte daha
 * kararlı olduğu için liste `items` altına sarılır.
 */
function ollamaSchema(properties) {
  return {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { type: "object", properties, required: ["title"] },
      },
    },
    required: ["items"],
  };
}

const BOOK_LOCAL_SCHEMA = ollamaSchema({
  title: { type: "string" },
  author: { type: "string" },
  confidence: { type: "number" },
});

const MEDIA_LOCAL_SCHEMA = ollamaSchema({
  title: { type: "string" },
  director: { type: "string" },
  genre: { type: "string" },
  releaseYear: { type: "number" },
  duration: { type: "number" },
  seasons: { type: "number" },
  episodeDuration: { type: "number" },
  confidence: { type: "number" },
});

/**
 * Yerel sağlayıcı adresini yalnız bu makineye kısıtlar ve yolu atar. Adres
 * arayüzden geldiği için, ana sürecin rastgele bir hedefe istek atmasını
 * engellemek adına loopback dışına çıkılmasına izin verilmez.
 */
function loopbackOrigin(raw) {
  try {
    const url = new URL(String(raw));
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    const host = url.hostname.replace(/^\[/, "").replace(/\]$/, "");
    if (!["localhost", "127.0.0.1", "::1"].includes(host)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

// Yerel modeller bulut kadar hızlı değil; ilk yüklemede dakikalar sürebiliyor.
const LOCAL_TIMEOUT_MS = 240_000;

/**
 * Ollama'nın varsayılan bağlamı (4096) bir raf fotoğrafına yetmiyor: görselin
 * token'ları tek başına ~2000, istem ve düşünme adımı da eklenince pencere
 * taşıyor ve model boş yanıt döndürüyordu — kullanıcı tarafında bu "fotoğrafta
 * kitap algılanamadı" olarak görünüyor. 8192 ölçümde tüm örnek raflara yetti.
 */
const LOCAL_NUM_CTX = 8192;

/**
 * Model yeteneklerini (`vision`, `thinking`) önbellekli olarak sorar.
 * `think` alanı desteklemeyen bir modele gönderilirse Ollama isteği reddettiği
 * için, göndermeden önce yeteneğe bakmak gerekiyor.
 */
const capabilityCache = new Map();

async function modelCapabilities(origin, model) {
  const key = `${origin}|${model}`;
  const cached = capabilityCache.get(key);
  if (cached) return cached;
  let caps = [];
  try {
    const res = await fetchWithTimeout(
      `${origin}/api/show`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      },
      10_000,
    );
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.capabilities)) caps = json.capabilities;
    }
  } catch {
    /* en iyi çaba: yetenek okunamazsa varsayılan (think göndermeden) devam */
  }
  capabilityCache.set(key, caps);
  return caps;
}

function localErrorMessage(status, bodyText) {
  if (status === 404)
    return "Model bulunamadı. Ayarlar → Yapay Zekâ bölümünden kurulu bir model seç.";
  if (status === 400)
    return `Yerel model isteği reddetti (400)${bodyText ? ": " + bodyText.slice(0, 160) : ""}`;
  return `Yerel model hatası (${status})${bodyText ? ": " + bodyText.slice(0, 160) : ""}`;
}

/** Yerel Ollama sunucusundan şemaya uygun nesne dizisi ister. */
async function detectWithOllama(origin, model, imageBase64, prompt, schema) {
  const caps = await modelCapabilities(origin, model);
  const body = {
    model,
    messages: [{ role: "user", content: prompt, images: [imageBase64] }],
    format: schema,
    stream: false,
    options: { temperature: 0, num_ctx: LOCAL_NUM_CTX },
  };
  // Düşünme adımı burada işe yaramıyor, bağlamı ve süreyi yiyor; destekleyen
  // modellerde kapatılır. Desteklemeyen modelde alan gönderilmez.
  if (caps.includes("thinking")) body.think = false;

  let res;
  try {
    res = await fetchWithTimeout(
      `${origin}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      LOCAL_TIMEOUT_MS,
    );
  } catch (err) {
    if (err && err.name === "AbortError")
      throw new Error(
        "Yerel model zaman aşımına uğradı. Daha küçük bir görsel ya da daha hızlı bir model dene.",
      );
    throw new Error(
      `Yerel model sunucusuna ulaşılamadı (${origin}). Ollama'nın çalıştığından emin ol.`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(localErrorMessage(res.status, text));
  }

  const json = await res.json();
  // Bazı modeller (ör. qwen3-vl) think:false altında yanıtı `content` yerine
  // `thinking` alanına yazıyor; ikisini de denemek gerekiyor.
  for (const field of [json?.message?.content, json?.message?.thinking]) {
    const parsed = safeParseJsonArray(field ?? "");
    if (parsed) return parsed;
  }
  throw new Error(
    "Yerel modelin yanıtı çözümlenemedi. Görsel desteği olan bir model seçtiğinden emin ol.",
  );
}

/** Kurulu yerel modelleri, görsel desteği bilgisiyle listeler. */
async function listLocalModels(rawUrl) {
  const origin = loopbackOrigin(rawUrl);
  if (!origin)
    return {
      ok: false,
      error:
        "Yerel model adresi yalnız bu bilgisayarda çalışan bir sunucuya (localhost) işaret edebilir.",
    };
  let res;
  try {
    res = await fetchWithTimeout(`${origin}/api/tags`, {}, 5_000);
  } catch {
    return {
      ok: false,
      error: `${origin} adresine ulaşılamadı. Ollama'nın çalıştığından emin ol.`,
    };
  }
  if (!res.ok)
    return { ok: false, error: `Model listesi alınamadı (${res.status}).` };
  const json = await res.json().catch(() => null);
  const models = Array.isArray(json?.models) ? json.models : [];
  return {
    ok: true,
    models: models.map((model) => ({
      name: String(model?.name ?? ""),
      vision: (
        model?.capabilities ??
        model?.details?.capabilities ??
        []
      ).includes("vision"),
    })),
  };
}

async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function geminiErrorMessage(status, bodyText) {
  if (status === 400)
    return "İstek geçersiz (400). Görsel çok büyük olabilir ya da anahtar hatalı.";
  if (status === 403)
    return 'Anahtar reddedildi (403). Anahtarın geçerli ve "Generative Language API"nin etkin olduğundan emin ol.';
  if (status === 429)
    return "Ücretsiz kota şu an dolu (429). Birkaç dakika bekleyip tekrar dene.";
  if (status >= 500)
    return `Yapay zekâ servisi geçici olarak yanıt vermedi (${status}). Tekrar dene.`;
  const snippet = (bodyText || "").slice(0, 160);
  return `Yapay zekâ servisi hatası (${status})${snippet ? ": " + snippet : ""}`;
}

/** Gemini'ye görseli gönderip şemaya uygun ham nesne dizisi ister. */
async function detectWithGemini(apiKey, imageBase64, mimeType, prompt, schema) {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.1,
    },
  };

  let res;
  try {
    res = await fetchWithTimeout(
      GEMINI_URL(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      45000,
    );
  } catch (err) {
    if (err && err.name === "AbortError")
      throw new Error(
        "İstek zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.",
      );
    throw new Error(
      "Ağ hatası: yapay zekâ servisine ulaşılamadı. İnternet bağlantını kontrol et.",
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(geminiErrorMessage(res.status, text));
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("") ?? "";
  const parsed = safeParseJsonArray(text);
  if (!parsed)
    throw new Error(
      "Yapay zekânın yanıtı çözümlenemedi. Daha net bir fotoğrafla tekrar dene.",
    );

  return parsed;
}

/**
 * Seçili sağlayıcıya göre görseli çözümler. Sağlayıcı ne olursa olsun geriye
 * aynı biçimde ham nesne dizisi döner; eşleme çağıran tarafta yapılır.
 */
function detectWithProvider(provider, imageBase64, mimeType, prompts, schemas) {
  if (provider.kind === "local")
    return detectWithOllama(
      provider.origin,
      provider.model,
      imageBase64,
      prompts.local ?? prompts.gemini,
      schemas.local,
    );
  return detectWithGemini(
    provider.apiKey,
    imageBase64,
    mimeType,
    prompts.gemini,
    schemas.gemini,
  );
}

function detectBooks(provider, imageBase64, mimeType) {
  return detectWithProvider(
    provider,
    imageBase64,
    mimeType,
    { gemini: DETECT_PROMPT, local: LOCAL_DETECT_PROMPT },
    { gemini: RESPONSE_SCHEMA, local: BOOK_LOCAL_SCHEMA },
  ).then((parsed) =>
    parsed
      .map((b) => ({
        title: cleanText(b?.title),
        author: cleanText(b?.author),
        confidence:
          typeof b?.confidence === "number" ? b.confidence : undefined,
      }))
      .filter((b) => b.title.length > 0),
  );
}

/**
 * Modelin metnini tek satıra indirger. Çok satırlı kitap sırtlarında modeller
 * satır sonlarını olduğu gibi aktarabiliyor; bu hâliyle başlık alanına yazılsa
 * listede ve aramada bozuk görünürdü.
 */
function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sayısal alanı yalnız makul aralıktaysa kabul eder; aksi halde boş bırakır. */
function boundedInt(value, min, max) {
  const parsed = typeof value === "number" ? Math.round(value) : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max)
    return undefined;
  return parsed;
}

function detectMedia(provider, imageBase64, mimeType, kind) {
  const nextYear = new Date().getFullYear() + 2;
  return detectWithProvider(
    provider,
    imageBase64,
    mimeType,
    { gemini: mediaDetectPrompt(kind) },
    { gemini: MEDIA_RESPONSE_SCHEMA, local: MEDIA_LOCAL_SCHEMA },
  ).then((parsed) =>
    parsed
      .map((item) => ({
        title: cleanText(item?.title),
        type: kind,
        director: cleanText(item?.director),
        genre: cleanText(item?.genre),
        releaseYear: boundedInt(item?.releaseYear, 1888, nextYear),
        duration:
          kind === "film" ? boundedInt(item?.duration, 1, 2000) : undefined,
        seasons:
          kind === "dizi" ? boundedInt(item?.seasons, 1, 10000) : undefined,
        episodeDuration:
          kind === "dizi"
            ? boundedInt(item?.episodeDuration, 1, 1000)
            : undefined,
        confidence:
          typeof item?.confidence === "number" ? item.confidence : undefined,
      }))
      .filter((item) => item.title.length > 0),
  );
}

/** responseMimeType=json olsa da olası kod-bloğu sarmalamasına karşı dayanıklı ayrıştırma. */
function safeParseJsonArray(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const v = JSON.parse(cleaned);
    if (Array.isArray(v)) return v;
    if (Array.isArray(v?.items)) return v.items;
    return Array.isArray(v?.books) ? v.books : null;
  } catch {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start !== -1 && end > start) {
      try {
        const v = JSON.parse(cleaned.slice(start, end + 1));
        return Array.isArray(v) ? v : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ---- Google Books zenginleştirme -------------------------------------------

function pickYear(publishedDate) {
  if (!publishedDate) return undefined;
  const m = String(publishedDate).match(/\d{4}/);
  return m ? Number(m[0]) : undefined;
}

function pickIsbn(identifiers) {
  if (!Array.isArray(identifiers)) return undefined;
  const i13 = identifiers.find((x) => x.type === "ISBN_13");
  const i10 = identifiers.find((x) => x.type === "ISBN_10");
  return (i13 || i10)?.identifier;
}

/** Tek bir kitabı Google Books ile zenginleştirir (en iyi çaba; hata olursa AI verisi korunur). */
async function enrichBook(book) {
  const enriched = { ...book, matched: false };
  try {
    const qParts = [`intitle:${book.title}`];
    if (book.author) qParts.push(`inauthor:${book.author}`);
    const url =
      "https://www.googleapis.com/books/v1/volumes?maxResults=1&q=" +
      encodeURIComponent(qParts.join(" "));

    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return enriched;
    const json = await res.json();
    const info = json?.items?.[0]?.volumeInfo;
    if (!info) return enriched;

    enriched.matched = true;
    if (
      !enriched.author &&
      Array.isArray(info.authors) &&
      info.authors.length
    ) {
      enriched.author = info.authors.join(", ");
    }
    enriched.publisher = info.publisher || undefined;
    enriched.pageCount =
      typeof info.pageCount === "number" && info.pageCount > 0
        ? info.pageCount
        : undefined;
    enriched.publicationYear = pickYear(info.publishedDate);
    enriched.isbn = pickIsbn(info.industryIdentifiers);
    enriched.genre =
      Array.isArray(info.categories) && info.categories.length
        ? info.categories[0]
        : undefined;
    enriched.language = info.language || undefined;
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    enriched.coverUrl = thumb ? thumb.replace(/^http:/, "https:") : undefined;
  } catch {
    /* en iyi çaba: zenginleştirme başarısızsa AI verisini koru */
  }
  return enriched;
}

/** Diziyi sınırlı eşzamanlılıkla işler (Google Books'u boğmamak için). */
async function mapWithConcurrency(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const cur = idx++;
      out[cur] = await fn(items[cur]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return out;
}

// ---- IPC kaydı --------------------------------------------------------------

/** Görsel giriş doğrulaması; hata varsa mesaj, sorun yoksa null döndürür. */
function validateImagePayload(payload) {
  const { imageBase64, mimeType } = payload || {};
  if (
    typeof imageBase64 !== "string" ||
    !imageBase64 ||
    imageBase64.length > 15 * 1024 * 1024
  )
    return "Görsel okunamadı. Lütfen tekrar dene.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType))
    return "Desteklenmeyen görsel türü.";
  return null;
}

/**
 * Arayüzden gelen sağlayıcı tercihini doğrulanmış bir çalıştırma bağlamına
 * çevirir. Gizli anahtar arayüze hiç geçmediği için Gemini anahtarı burada,
 * güvenli depodan okunur.
 */
function resolveProvider(payload, getApiKey) {
  if (payload?.provider === "local") {
    const origin = loopbackOrigin(payload?.localUrl);
    if (!origin)
      return {
        error:
          "Yerel model adresi yalnız bu bilgisayarda çalışan bir sunucuya (localhost) işaret edebilir.",
      };
    const model = String(payload?.localModel ?? "").trim();
    if (!model)
      return {
        error:
          "Yerel model seçilmedi. Ayarlar → Yapay Zekâ bölümünden bir model seç.",
      };
    return { provider: { kind: "local", origin, model } };
  }
  const apiKey = getApiKey();
  if (!apiKey)
    return {
      error:
        "Gemini API anahtarı ayarlı değil. Ayarlar → Yapay Zekâ bölümünden ekle.",
    };
  return { provider: { kind: "gemini", apiKey } };
}

function registerAiIpc({ handle, getApiKey }) {
  handle("ai:localModels", (url) => listLocalModels(url));

  handle("ai:detectBooks", async (payload) => {
    const invalid = validateImagePayload(payload);
    if (invalid) return { ok: false, error: invalid };
    const { provider, error } = resolveProvider(payload, getApiKey);
    if (error) return { ok: false, error };
    try {
      const raw = await detectBooks(
        provider,
        payload.imageBase64,
        payload.mimeType,
      );
      if (raw.length === 0) return { ok: true, books: [] };
      // Çevrimdışıyken yerel model çalışmaya devam eder, ama künye
      // zenginleştirmesi ağ gerektirdiği için atlanır.
      if (payload.allowNetwork === false)
        return { ok: true, books: raw.map((b) => ({ ...b, matched: false })) };
      const books = await mapWithConcurrency(raw, 5, enrichBook);
      return { ok: true, books };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  handle("ai:detectMedia", async (payload) => {
    const invalid = validateImagePayload(payload);
    if (invalid) return { ok: false, error: invalid };
    const kind = payload?.type;
    if (kind !== "film" && kind !== "dizi")
      return { ok: false, error: "Geçersiz içerik türü." };
    const { provider, error } = resolveProvider(payload, getApiKey);
    if (error) return { ok: false, error };
    try {
      return {
        ok: true,
        items: await detectMedia(
          provider,
          payload.imageBase64,
          payload.mimeType,
          kind,
        ),
      };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

// loopbackOrigin güvenlik sınırını çizdiği için testlerden de erişilebilir.
module.exports = { registerAiIpc, loopbackOrigin };
