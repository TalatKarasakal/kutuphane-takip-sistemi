const { ipcMain } = require('electron');

// ---- Gemini ----------------------------------------------------------------

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

const DETECT_PROMPT = [
  'Bu fotoğrafta görünen kitapları tanımla.',
  'Kitap sırtı veya kapağı kısmen görünse bile, okuyabildiğin tüm kitapları listele.',
  'Her kitap için başlık (title) ver; yazar (author) okunabiliyorsa ekle, okunamıyorsa boş bırak.',
  'Türkçe kitap ve yazar adlarını olduğu gibi, Türkçe karakterleriyle koru.',
  'Emin olmadığın kitapları da düşük confidence (0 ile 1 arası) ile ekle.',
  'Yalnızca gerçek kitapları dahil et; dekoratif nesne, dergi veya kutuları atla.',
  'Aynı kitabı iki kez yazma.',
].join(' ');

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      author: { type: 'STRING' },
      confidence: { type: 'NUMBER' },
    },
    required: ['title'],
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
  if (status === 400) return 'İstek geçersiz (400). Görsel çok büyük olabilir ya da anahtar hatalı.';
  if (status === 403) return 'Anahtar reddedildi (403). Anahtarın geçerli ve "Generative Language API"nin etkin olduğundan emin ol.';
  if (status === 429) return 'Ücretsiz kota şu an dolu (429). Birkaç dakika bekleyip tekrar dene.';
  if (status >= 500) return `Yapay zekâ servisi geçici olarak yanıt vermedi (${status}). Tekrar dene.`;
  const snippet = (bodyText || '').slice(0, 160);
  return `Yapay zekâ servisi hatası (${status})${snippet ? ': ' + snippet : ''}`;
}

/** Gemini'den ham {title, author, confidence} listesi çıkarır. */
async function detectWithGemini(apiKey, imageBase64, mimeType) {
  const body = {
    contents: [
      {
        parts: [
          { text: DETECT_PROMPT },
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  let res;
  try {
    res = await fetchWithTimeout(
      GEMINI_URL(apiKey),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
      45000,
    );
  } catch (err) {
    if (err && err.name === 'AbortError') throw new Error('İstek zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.');
    throw new Error('Ağ hatası: yapay zekâ servisine ulaşılamadı. İnternet bağlantını kontrol et.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(geminiErrorMessage(res.status, text));
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('') ?? '';
  const parsed = safeParseJsonArray(text);
  if (!parsed) throw new Error('Yapay zekânın yanıtı çözümlenemedi. Daha net bir fotoğrafla tekrar dene.');

  return parsed
    .map((b) => ({
      title: String(b?.title ?? '').trim(),
      author: String(b?.author ?? '').trim(),
      confidence: typeof b?.confidence === 'number' ? b.confidence : undefined,
    }))
    .filter((b) => b.title.length > 0);
}

/** responseMimeType=json olsa da olası kod-bloğu sarmalamasına karşı dayanıklı ayrıştırma. */
function safeParseJsonArray(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    const v = JSON.parse(cleaned);
    return Array.isArray(v) ? v : Array.isArray(v?.books) ? v.books : null;
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
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
  const i13 = identifiers.find((x) => x.type === 'ISBN_13');
  const i10 = identifiers.find((x) => x.type === 'ISBN_10');
  return (i13 || i10)?.identifier;
}

/** Tek bir kitabı Google Books ile zenginleştirir (en iyi çaba; hata olursa AI verisi korunur). */
async function enrichBook(book) {
  const enriched = { ...book, matched: false };
  try {
    const qParts = [`intitle:${book.title}`];
    if (book.author) qParts.push(`inauthor:${book.author}`);
    const url =
      'https://www.googleapis.com/books/v1/volumes?maxResults=1&q=' +
      encodeURIComponent(qParts.join(' '));

    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return enriched;
    const json = await res.json();
    const info = json?.items?.[0]?.volumeInfo;
    if (!info) return enriched;

    enriched.matched = true;
    if (!enriched.author && Array.isArray(info.authors) && info.authors.length) {
      enriched.author = info.authors.join(', ');
    }
    enriched.publisher = info.publisher || undefined;
    enriched.pageCount = typeof info.pageCount === 'number' && info.pageCount > 0 ? info.pageCount : undefined;
    enriched.publicationYear = pickYear(info.publishedDate);
    enriched.isbn = pickIsbn(info.industryIdentifiers);
    enriched.genre = Array.isArray(info.categories) && info.categories.length ? info.categories[0] : undefined;
    enriched.language = info.language || undefined;
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    enriched.coverUrl = thumb ? thumb.replace(/^http:/, 'https:') : undefined;
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
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---- IPC kaydı --------------------------------------------------------------

function registerAiIpc() {
  ipcMain.handle('ai:detectBooks', async (_e, payload) => {
    const { apiKey, imageBase64, mimeType } = payload || {};
    if (!apiKey || !String(apiKey).trim()) {
      return { ok: false, error: 'Gemini API anahtarı ayarlı değil. Ayarlar → Yapay Zekâ bölümünden ekle.' };
    }
    if (!imageBase64) {
      return { ok: false, error: 'Görsel okunamadı. Lütfen tekrar dene.' };
    }
    try {
      const raw = await detectWithGemini(String(apiKey).trim(), imageBase64, mimeType);
      if (raw.length === 0) {
        return { ok: true, books: [] };
      }
      const books = await mapWithConcurrency(raw, 5, enrichBook);
      return { ok: true, books };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

module.exports = { registerAiIpc };
