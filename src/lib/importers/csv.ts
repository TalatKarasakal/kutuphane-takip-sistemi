import Papa from 'papaparse';
import { isRtf, rtfToPlainText } from './rtf';

export interface ParsedCsv {
  rows: unknown[][];
  wasRtf: boolean;
}

export async function parseCsv(file: File): Promise<ParsedCsv> {
  let text = await file.text();
  let wasRtf = false;
  if (isRtf(text)) {
    wasRtf = true;
    text = rtfToPlainText(text);
  }
  const delim = detectDelimiter(text);
  const res = Papa.parse<unknown[]>(text, { header: false, skipEmptyLines: true, delimiter: delim });
  return { rows: (res.data as unknown[][]).filter((r) => Array.isArray(r)), wasRtf };
}

function detectDelimiter(text: string): string | undefined {
  const sample = text.split('\n').slice(0, 5).join('\n');
  const counts = { ',': 0, ';': 0, '\t': 0, '|': 0 } as Record<string, number>;
  for (const ch of sample) if (ch in counts) counts[ch]++;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : undefined;
}
