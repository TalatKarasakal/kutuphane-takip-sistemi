import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { parseXlsx } from '../../lib/importers/xlsx';
import { parseCsv } from '../../lib/importers/csv';
import { parseJson } from '../../lib/importers/json';
import { guessField, FIELD_LABELS, MAPPABLE_FIELDS, type MappableField } from '../../lib/importers/fieldGuess';
import { normalizeStatus, STATUSES } from '../../constants/statuses';
import { parseNumber } from '../../lib/utils';
import { useBooks } from '../../store/booksStore';
import type { Book, BookStatus } from '../../types/book';
import { FileSpreadsheet, FileJson, FileText, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Step = 'pick' | 'sheet' | 'map' | 'preview';

interface SheetData {
  name: string;
  rows: unknown[][];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: Props) {
  const { addMany } = useBooks();
  const [step, setStep] = useState<Step>('pick');
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [headerRowIdx, setHeaderRowIdx] = useState(0);
  const [mapping, setMapping] = useState<Record<number, MappableField>>({});
  const [statusMap, setStatusMap] = useState<Record<string, BookStatus>>({});
  const [notice, setNotice] = useState<string>('');

  const reset = () => {
    setStep('pick'); setFileName(''); setSheets([]); setSheetIdx(0); setHeaderRowIdx(0); setMapping({}); setStatusMap({}); setNotice('');
  };

  const close = () => { reset(); onClose(); };

  const onFile = async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'ods') {
      const wb = await parseXlsx(file);
      setSheets(wb.sheets);
      setStep(wb.sheets.length > 1 ? 'sheet' : 'map');
      initMapping(wb.sheets[0].rows, 0);
    } else if (ext === 'csv' || ext === 'tsv') {
      const res = await parseCsv(file);
      setSheets([{ name: 'CSV', rows: res.rows }]);
      initMapping(res.rows, 0);
      if (res.wasRtf) {
        setNotice('Dosya RTF (Zengin Metin) olarak kaydedilmiş; düz metne çevirdim. Kalıcı düzeltme için TextEdit\'te Biçim → Düz Metin Yap (⇧⌘T) seçip yeniden kaydet.');
      }
      setStep('map');
    } else if (ext === 'json') {
      const res = await parseJson(file);
      setSheets([{ name: 'JSON', rows: res.rows }]);
      initMapping(res.rows, 0);
      setStep('map');
    } else {
      alert('Desteklenmeyen dosya türü: ' + ext);
    }
  };

  const initMapping = (rows: unknown[][], headerIdx: number) => {
    const headers = (rows[headerIdx] ?? []) as string[];
    const m: Record<number, MappableField> = {};
    headers.forEach((h, i) => { m[i] = guessField(String(h ?? '')); });
    setMapping(m);
  };

  const onPickSheet = (idx: number) => {
    setSheetIdx(idx);
    initMapping(sheets[idx].rows, 0);
    setStep('map');
  };

  const headers = (sheets[sheetIdx]?.rows[headerRowIdx] ?? []) as string[];
  const dataRows = (sheets[sheetIdx]?.rows.slice(headerRowIdx + 1) ?? []);

  const statusColIdx = Object.entries(mapping).find(([, v]) => v === 'status')?.[0];
  const statusRawValues = statusColIdx != null
    ? [...new Set(dataRows.map((r) => String((r as unknown[])[Number(statusColIdx)] ?? '').trim()).filter(Boolean))]
    : [];

  const buildBooks = (): { rows: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[]; errors: { row: number; reason: string }[] } => {
    const result: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[] = [];
    const errors: { row: number; reason: string }[] = [];
    dataRows.forEach((r, i) => {
      const row = r as unknown[];
      const book: Partial<Book> = { status: 'mevcut' };
      Object.entries(mapping).forEach(([colStr, field]) => {
        if (field === '__ignore__') return;
        const col = Number(colStr);
        const raw = row[col];
        if (raw == null || raw === '') return;
        switch (field) {
          case 'pageCount':
          case 'publicationYear':
            book[field] = parseNumber(raw);
            break;
          case 'status': {
            const key = String(raw).trim();
            const mapped = statusMap[key] ?? normalizeStatus(raw);
            if (mapped) book.status = mapped;
            break;
          }
          default:
            (book as Record<string, unknown>)[field] = String(raw);
        }
      });
      if (!book.title || !book.author) {
        errors.push({ row: i + 1, reason: !book.title ? 'Başlık eksik' : 'Yazar eksik' });
        return;
      }
      result.push(book as Omit<Book, 'id' | 'addedAt' | 'updatedAt'>);
    });
    return { rows: result, errors };
  };

  const doImport = async () => {
    const { rows } = buildBooks();
    await addMany(rows);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title={'İçe Aktar' + (fileName ? ` · ${fileName}` : '')}
      footer={
        <>
          {step !== 'pick' && <button className="btn btn-ghost" onClick={reset}>Baştan</button>}
          <button className="btn btn-ghost" onClick={close}>Kapat</button>
          {step === 'map' && <button className="btn btn-primary" onClick={() => setStep('preview')}>Önizle</button>}
          {step === 'preview' && <button className="btn btn-primary" onClick={doImport}>İçe Aktar</button>}
        </>
      }
    >
      {step === 'pick' && <PickStep onFile={onFile} />}
      {step === 'sheet' && <SheetStep sheets={sheets} onPick={onPickSheet} />}
      {notice && step !== 'pick' && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 text-amber-500 shrink-0" />
          <div className="text-amber-800 dark:text-amber-200">{notice}</div>
        </div>
      )}
      {step === 'map' && (
        <MapStep
          headers={headers}
          dataRows={dataRows}
          mapping={mapping}
          setMapping={setMapping}
          headerRowIdx={headerRowIdx}
          setHeaderRowIdx={(i) => { setHeaderRowIdx(i); initMapping(sheets[sheetIdx].rows, i); }}
          allRows={sheets[sheetIdx]?.rows ?? []}
          statusRawValues={statusRawValues}
          statusMap={statusMap}
          setStatusMap={setStatusMap}
        />
      )}
      {step === 'preview' && <PreviewStep result={buildBooks()} />}
    </Modal>
  );
}

function PickStep({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="py-6">
      <label
        className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface2'}`}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation(); setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <Upload size={28} className="mx-auto mb-3 text-primary" />
        <div className="font-medium mb-1">Dosya seç ya da buraya sürükle-bırak</div>
        <div className="text-sm text-muted mb-4">.xlsx · .xls · .ods · .csv · .tsv · .json</div>
        <input
          type="file"
          accept=".xlsx,.xls,.ods,.csv,.tsv,.json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
        <span className="btn btn-primary">Dosya Seç</span>
      </label>
      <div className="grid grid-cols-3 gap-3 mt-5">
        <Hint icon={<FileSpreadsheet size={16} />} label="Excel" text="Sütun adı/sırası serbest; bir sonraki adımda eşlersin." />
        <Hint icon={<FileText size={16} />} label="CSV" text="UTF-8 önerilir. Başlık satırı olması idealdir." />
        <Hint icon={<FileJson size={16} />} label="JSON" text="Uygulamanın dışa aktarım JSON'u doğrudan içe alınır." />
      </div>
    </div>
  );
}

function Hint({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 mb-1 font-medium text-sm">{icon} {label}</div>
      <div className="text-xs text-muted">{text}</div>
    </div>
  );
}

function SheetStep({ sheets, onPick }: { sheets: SheetData[]; onPick: (i: number) => void }) {
  return (
    <div className="py-4">
      <div className="text-sm text-muted mb-3">Birden fazla sayfa bulundu — içe aktarmak istediğin sayfayı seç:</div>
      <div className="grid grid-cols-2 gap-2">
        {sheets.map((s, i) => (
          <button key={i} className="card p-3 text-left hover:bg-surface2" onClick={() => onPick(i)}>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-muted">{Math.max(0, s.rows.length - 1)} satır</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MapStep({
  headers, dataRows, mapping, setMapping, headerRowIdx, setHeaderRowIdx, allRows,
  statusRawValues, statusMap, setStatusMap,
}: {
  headers: string[];
  dataRows: unknown[][];
  mapping: Record<number, MappableField>;
  setMapping: (m: Record<number, MappableField>) => void;
  headerRowIdx: number;
  setHeaderRowIdx: (i: number) => void;
  allRows: unknown[][];
  statusRawValues: string[];
  statusMap: Record<string, BookStatus>;
  setStatusMap: (m: Record<string, BookStatus>) => void;
}) {
  const maxRow = Math.min(allRows.length, 10);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Başlık satırı:</span>
        <select className="input max-w-[140px]" value={headerRowIdx} onChange={(e) => setHeaderRowIdx(Number(e.target.value))}>
          {Array.from({ length: maxRow }).map((_, i) => <option key={i} value={i}>{i + 1}. satır</option>)}
        </select>
        <span className="text-xs text-muted">Dosyadaki sütun adlarının hangi satırda olduğunu seç.</span>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Sütun Eşleme</div>
        <div className="card divide-y divide-border">
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="w-1/3 min-w-0">
                <div className="text-sm font-medium truncate">{String(h || `Sütun ${i + 1}`)}</div>
                <div className="text-xs text-muted truncate">
                  Örn: {dataRows.slice(0, 2).map((r) => String((r as unknown[])[i] ?? '')).filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <select
                className="input max-w-xs"
                value={mapping[i] ?? '__ignore__'}
                onChange={(e) => setMapping({ ...mapping, [i]: e.target.value as MappableField })}
              >
                {MAPPABLE_FIELDS.map((f) => <option key={f} value={f}>{FIELD_LABELS[f]}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {statusRawValues.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Durum Eşleme</div>
          <div className="card p-3 space-y-2">
            {statusRawValues.map((v) => (
              <div key={v} className="flex items-center gap-3">
                <code className="chip">{v}</code>
                <span className="text-muted text-xs">→</span>
                <select
                  className="input max-w-xs"
                  value={statusMap[v] ?? (normalizeStatusOrDefault(v))}
                  onChange={(e) => setStatusMap({ ...statusMap, [v]: e.target.value as BookStatus })}
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeStatusOrDefault(v: string): BookStatus {
  return normalizeStatus(v) ?? 'mevcut';
}

function PreviewStep({ result }: { result: { rows: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[]; errors: { row: number; reason: string }[] } }) {
  const { rows, errors } = result;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="chip bg-emerald-500/15 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={12} /> {rows.length} geçerli</div>
        {errors.length > 0 && <div className="chip bg-rose-500/15 border-rose-500/20 text-rose-700 dark:text-rose-300"><AlertTriangle size={12} /> {errors.length} hatalı</div>}
      </div>
      {errors.length > 0 && (
        <div className="card p-3 max-h-32 overflow-auto text-xs text-muted">
          {errors.slice(0, 20).map((e) => <div key={e.row}>Satır {e.row}: {e.reason}</div>)}
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2 text-left">Başlık</th>
              <th className="px-3 py-2 text-left">Yazar</th>
              <th className="px-3 py-2 text-left">Yayınevi</th>
              <th className="px-3 py-2 text-left">Tür</th>
              <th className="px-3 py-2 text-left">Durum</th>
              <th className="px-3 py-2 text-right">Sayfa</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{r.title}</td>
                <td className="px-3 py-2">{r.author}</td>
                <td className="px-3 py-2 text-muted">{r.publisher ?? '—'}</td>
                <td className="px-3 py-2">{r.genre ?? '—'}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 text-right">{r.pageCount ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 20 && <div className="text-xs text-muted">İlk 20 satır gösterildi. İçe aktarılacak toplam: {rows.length}</div>}
    </div>
  );
}
