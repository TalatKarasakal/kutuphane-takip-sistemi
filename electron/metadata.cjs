const ISBN_RE = /^(?:\d{9}[\dX]|\d{13})$/;

function normalizeIsbn(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^0-9X]/g, "");
}

function validIsbn(isbn) {
  if (!ISBN_RE.test(isbn)) return false;
  if (isbn.length === 13)
    return (
      [...isbn].reduce(
        (sum, char, index) => sum + Number(char) * (index % 2 ? 3 : 1),
        0,
      ) %
        10 ===
      0
    );
  return (
    [...isbn].reduce(
      (sum, char, index) =>
        sum + (char === "X" ? 10 : Number(char)) * (10 - index),
      0,
    ) %
      11 ===
    0
  );
}

function googleBook(item) {
  const info = item?.volumeInfo;
  if (!info?.title) return null;
  const thumbnail =
    info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
  return {
    title: String(info.title).trim(),
    author:
      Array.isArray(info.authors) && info.authors.length
        ? info.authors.join(", ")
        : "Bilinmiyor",
    publisher: info.publisher || undefined,
    pageCount:
      Number.isInteger(info.pageCount) && info.pageCount > 0
        ? info.pageCount
        : undefined,
    publicationYear:
      Number(String(info.publishedDate || "").match(/\d{4}/)?.[0]) || undefined,
    isbn:
      info.industryIdentifiers?.find((entry) => entry.type === "ISBN_13")
        ?.identifier ||
      info.industryIdentifiers?.find((entry) => entry.type === "ISBN_10")
        ?.identifier,
    genre: Array.isArray(info.categories) ? info.categories[0] : undefined,
    language: info.language || undefined,
    coverUrl: thumbnail ? thumbnail.replace(/^http:/, "https:") : undefined,
    matched: true,
  };
}

async function lookupIsbn(value) {
  const isbn = normalizeIsbn(value);
  if (!validIsbn(isbn))
    return { ok: false, error: "Geçerli bir ISBN-10 veya ISBN-13 girin." };
  try {
    const googleResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?maxResults=5&q=isbn:${encodeURIComponent(isbn)}`,
      {
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (googleResponse.ok) {
      const google = await googleResponse.json();
      const books = (google.items || []).map(googleBook).filter(Boolean);
      if (books.length) return { ok: true, books };
    }
    const openResponse = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`,
      {
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!openResponse.ok) throw new Error(`OpenLibrary ${openResponse.status}`);
    const open = await openResponse.json();
    const info = open[`ISBN:${isbn}`];
    if (!info?.title) return { ok: true, books: [] };
    return {
      ok: true,
      books: [
        {
          title: info.title,
          author:
            Array.isArray(info.authors) && info.authors.length
              ? info.authors.map((author) => author.name).join(", ")
              : "Bilinmiyor",
          publisher: info.publishers?.[0]?.name,
          publicationYear:
            Number(String(info.publish_date || "").match(/\d{4}/)?.[0]) ||
            undefined,
          pageCount: Number.isInteger(info.number_of_pages)
            ? info.number_of_pages
            : undefined,
          isbn,
          coverUrl: info.cover?.large || info.cover?.medium || undefined,
          matched: true,
        },
      ],
    };
  } catch (error) {
    return {
      ok: false,
      error: `Künye servisine ulaşılamadı: ${String(error?.message || error)}`,
    };
  }
}

module.exports = { lookupIsbn };
