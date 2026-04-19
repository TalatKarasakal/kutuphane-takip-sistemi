export interface ParsedJson {
  rows: unknown[][];
  headers: string[];
  records?: Record<string, unknown>[];
}

export async function parseJson(file: File): Promise<ParsedJson> {
  const text = await file.text();
  const data = JSON.parse(text);
  const arr: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data?.books) ? data.books : [data];
  const headerSet = new Set<string>();
  arr.forEach((r) => Object.keys(r ?? {}).forEach((k) => headerSet.add(k)));
  const headers = [...headerSet];
  const rows: unknown[][] = [headers, ...arr.map((r) => headers.map((h) => (r as Record<string, unknown>)?.[h] ?? ''))];
  return { rows, headers, records: arr };
}
