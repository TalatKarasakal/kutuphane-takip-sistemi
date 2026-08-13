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

function detectBooksWithGemini(apiKey, imageBase64, mimeType) {
  return detectWithGemini(
    apiKey,
    imageBase64,
    mimeType,
    DETECT_PROMPT,
    RESPONSE_SCHEMA,
  ).then((parsed) =>
    parsed
      .map((b) => ({
        title: String(b?.title ?? "").trim(),
        author: String(b?.author ?? "").trim(),
        confidence:
          typeof b?.confidence === "number" ? b.confidence : undefined,
      }))
      .filter((b) => b.title.length > 0),
  );
}

/** Sayısal alanı yalnız makul aralıktaysa kabul eder; aksi halde boş bırakır. */
function boundedInt(value, min, max) {
  const parsed = typeof value === "number" ? Math.round(value) : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max)
    return undefined;
  return parsed;
}

function detectMediaWithGemini(apiKey, imageBase64, mimeType, kind) {
  const nextYear = new Date().getFullYear() + 2;
  return detectWithGemini(
    apiKey,
    imageBase64,
    mimeType,
    mediaDetectPrompt(kind),
    MEDIA_RESPONSE_SCHEMA,
  ).then((parsed) =>
    parsed
      .map((item) => ({
        title: String(item?.title ?? "").trim(),
        type: kind,
        director: String(item?.director ?? "").trim(),
        genre: String(item?.genre ?? "").trim(),
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
    return Array.isArray(v) ? v : Array.isArray(v?.books) ? v.books : null;
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

/** Ortak giriş doğrulaması; hata varsa {error} döndürür. */
function validateImagePayload(payload, apiKey) {
  const { imageBase64, mimeType } = payload || {};
  if (!apiKey)
    return "Gemini API anahtarı ayarlı değil. Ayarlar → Yapay Zekâ bölümünden ekle.";
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

function registerAiIpc({ handle, getApiKey }) {
  handle("ai:detectBooks", async (payload) => {
    const apiKey = getApiKey();
    const invalid = validateImagePayload(payload, apiKey);
    if (invalid) return { ok: false, error: invalid };
    try {
      const raw = await detectBooksWithGemini(
        apiKey,
        payload.imageBase64,
        payload.mimeType,
      );
      if (raw.length === 0) return { ok: true, books: [] };
      const books = await mapWithConcurrency(raw, 5, enrichBook);
      return { ok: true, books };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  handle("ai:detectMedia", async (payload) => {
    const apiKey = getApiKey();
    const invalid = validateImagePayload(payload, apiKey);
    if (invalid) return { ok: false, error: invalid };
    const kind = payload?.type;
    if (kind !== "film" && kind !== "dizi")
      return { ok: false, error: "Geçersiz içerik türü." };
    try {
      return {
        ok: true,
        items: await detectMediaWithGemini(
          apiKey,
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

module.exports = { registerAiIpc };
