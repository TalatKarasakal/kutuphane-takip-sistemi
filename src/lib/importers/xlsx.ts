import * as XLSX from 'xlsx';

export interface ParsedSheet {
  name: string;
  rows: unknown[][];
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
}

export async function parseXlsx(file: File): Promise<ParsedWorkbook> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheets: ParsedSheet[] = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', blankrows: false, raw: false });
    return { name, rows };
  });
  return { sheets };
}
