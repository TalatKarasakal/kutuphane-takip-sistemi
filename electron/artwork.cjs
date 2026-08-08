const dns = require("dns").promises;
const { isIP } = require("net");

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function isPrivateIpv4(address) {
  const parts = address.split(".").map(Number);
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 0 ||
    parts[0] >= 224
  );
}

function isPrivateAddress(address) {
  if (isIP(address) === 4) return isPrivateIpv4(address);
  const value = address.toLowerCase();
  return (
    value === "::1" ||
    value === "::" ||
    value.startsWith("fe8") ||
    value.startsWith("fe9") ||
    value.startsWith("fea") ||
    value.startsWith("feb") ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("::ffff:127.")
  );
}

async function validateUrl(raw) {
  if (typeof raw !== "string" || raw.length > 2048)
    throw new Error("Görsel adresi geçersiz.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    throw new Error("Yalnız standart HTTPS görsel adresleri kabul edilir.");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some((entry) => isPrivateAddress(entry.address))
  )
    throw new Error("Özel veya yerel ağ adresleri engellendi.");
  return url;
}

async function fetchArtwork(rawUrl) {
  try {
    let url = await validateUrl(rawUrl);
    let response;
    for (let redirect = 0; redirect < 4; redirect += 1) {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": "Kutuphanem-Desktop" },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) throw new Error("Geçersiz yönlendirme.");
      url = await validateUrl(new URL(location, url).toString());
    }
    if (!response?.ok)
      throw new Error(
        `Görsel sunucusu ${response?.status || "yanıt vermedi"}.`,
      );
    const mimeType = String(response.headers.get("content-type") || "")
      .split(";")[0]
      .toLowerCase();
    if (!ALLOWED_TYPES.has(mimeType))
      throw new Error("Desteklenmeyen görsel türü.");
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > MAX_BYTES) throw new Error("Görsel 10 MB sınırını aşıyor.");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Görsel gövdesi okunamadı.");
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) throw new Error("Görsel 10 MB sınırını aşıyor.");
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    chunks.forEach((chunk) => {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return { ok: true, bytes, mimeType };
  } catch (error) {
    return { ok: false, error: String(error?.message || error) };
  }
}

module.exports = { fetchArtwork };
