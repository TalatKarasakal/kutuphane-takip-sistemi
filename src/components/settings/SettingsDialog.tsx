import { useRef, useState } from 'react';
import { DatabaseBackup, FolderOpen, RotateCcw, Save, Sparkles, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useSettings } from '../../store/settingsStore';
import { useToast } from '../../store/toastStore';
import { FONT_OPTIONS } from '../../lib/theme';
import { createBackup, restoreSnapshot, isElectron } from '../../lib/backup';

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, accent, fontFamily, fontSize, density, view, set, reset } = useSettings();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ayarlar"
      size="md"
      footer={
        <>
          <button className="btn btn-ghost" onClick={reset}>Sıfırla</button>
          <button className="btn btn-primary" onClick={onClose}>Tamam</button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Tema">
          <Segmented
            value={theme}
            onChange={(v) => set('theme', v as typeof theme)}
            options={[
              { value: 'light', label: 'Açık' },
              { value: 'dark', label: 'Koyu' },
              { value: 'system', label: 'Sistem' },
            ]}
          />
        </Section>

        <Section title="Vurgu Rengi">
          <div className="flex gap-2">
            <AccentChip active={accent === 'turkuaz'} color="bg-[#14b8a6]" onClick={() => set('accent', 'turkuaz')}>Turkuaz</AccentChip>
            <AccentChip active={accent === 'kirmizi'} color="bg-[#dc2626]" onClick={() => set('accent', 'kirmizi')}>Kırmızı</AccentChip>
          </div>
          <div className="text-xs text-muted mt-2">Her iki renk de palette yer alır; seçtiğin birincil vurgu olur, diğeri ikincil.</div>
        </Section>

        <Section title="Yazı Tipi">
          <select className="input" value={fontFamily} onChange={(e) => set('fontFamily', e.target.value)}>
            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value} style={{ fontFamily: f.stack }}>{f.value}</option>)}
          </select>
        </Section>

        <Section title={`Punto · ${fontSize}px`}>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={fontSize}
            onChange={(e) => set('fontSize', Number(e.target.value))}
            className="w-full accent-[rgb(var(--primary))]"
          />
          <div className="flex justify-between text-[11px] text-muted mt-1"><span>12</span><span>17</span><span>22</span></div>
        </Section>

        <Section title="Yoğunluk">
          <Segmented
            value={density}
            onChange={(v) => set('density', v as typeof density)}
            options={[
              { value: 'comfortable', label: 'Konforlu' },
              { value: 'compact', label: 'Sıkışık' },
            ]}
          />
        </Section>

        <Section title="Varsayılan Görünüm">
          <Segmented
            value={view}
            onChange={(v) => set('view', v as typeof view)}
            options={[
              { value: 'table', label: 'Tablo' },
              { value: 'card', label: 'Kart' },
            ]}
          />
        </Section>

        <AiSection />

        <BackupSection />
      </div>
    </Modal>
  );
}

function AiSection() {
  const { geminiApiKey, set } = useSettings();
  const [reveal, setReveal] = useState(false);

  return (
    <Section title="Yapay Zekâ · Fotoğraftan Ekle">
      <div className="space-y-2">
        <div className="text-xs text-muted">
          Kitap fotoğrafından otomatik ekleme için Google'ın ücretsiz Gemini servisini kullanır.
          Anahtar yalnızca bu cihazda saklanır; yedeklere veya dışa aktarımlara dâhil edilmez.
        </div>
        <div className="relative">
          <input
            type={reveal ? 'text' : 'password'}
            className="input pr-10"
            placeholder="Gemini API anahtarını yapıştır…"
            value={geminiApiKey ?? ''}
            onChange={(e) => set('geminiApiKey', e.target.value.trim() || undefined)}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Gizle' : 'Göster'}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Sparkles size={13} /> Ücretsiz anahtar al (Google AI Studio) <ExternalLink size={12} />
        </a>
      </div>
    </Section>
  );
}

function BackupSection() {
  const { autoBackup, backupFrequency, lastBackupAt, set } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const electron = isElectron();

  const onBackupNow = async () => {
    setBusy(true);
    try {
      const res = await createBackup();
      if (res.ok) {
        useToast.getState().show(res.mode === 'electron' ? 'Yedek diske kaydedildi' : 'Yedek dosyası indirildi');
      } else {
        useToast.getState().show(res.error ?? 'Yedek alınamadı', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const onReveal = async () => {
    await window.kutuphanem?.backup.reveal();
  };

  const onRestoreFile = async (file: File) => {
    const text = await file.text();
    const ok = window.confirm(
      'Bu yedek dosyasını geri yüklemek MEVCUT TÜM VERİYİ değiştirecek. ' +
        (electron ? 'Değiştirmeden önce otomatik bir güvenlik yedeği alınacak. ' : '') +
        'Devam edilsin mi?',
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await restoreSnapshot(text);
      if (res.ok) {
        useToast.getState().show(`Geri yüklendi: ${res.books} kitap, ${res.media} film/dizi`);
      } else {
        useToast.getState().show(res.error ?? 'Geri yükleme başarısız', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Yedekleme">
      <div className="space-y-3">
        <div className="text-xs text-muted">
          {lastBackupAt
            ? `Son yedek: ${new Date(lastBackupAt).toLocaleString('tr-TR')}`
            : 'Henüz yedek alınmadı.'}
          {!electron && ' · Tarayıcıda yedek dosya olarak indirilir; otomatik yedek yalnızca masaüstü uygulamasında çalışır.'}
        </div>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">Otomatik yedekle</span>
          <input
            type="checkbox"
            className="accent-[rgb(var(--primary))] w-4 h-4"
            checked={autoBackup}
            onChange={(e) => set('autoBackup', e.target.checked)}
          />
        </label>

        {autoBackup && (
          <Segmented
            value={backupFrequency}
            onChange={(v) => set('backupFrequency', v)}
            options={[
              { value: 'launch', label: 'Her açılış' },
              { value: 'daily', label: 'Günlük' },
              { value: 'weekly', label: 'Haftalık' },
            ]}
          />
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button className="btn btn-outline" onClick={onBackupNow} disabled={busy}>
            <Save size={15} /> Şimdi Yedekle
          </button>
          {electron && (
            <button className="btn btn-ghost" onClick={onReveal}>
              <FolderOpen size={15} /> Klasörü Aç
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
            <RotateCcw size={15} /> Dosyadan Geri Yükle
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onRestoreFile(f);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-muted">
          <DatabaseBackup size={14} className="mt-0.5 shrink-0" />
          <span>
            Yedekler tüm kitap ve film/dizi verini içerir.
            {electron && ' Uygulama içinde, kullanıcı verisi klasöründeki "backups" altında son 20 yedek saklanır.'}
          </span>
        </div>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{title}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex border border-border rounded-lg bg-surface overflow-hidden">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm ${value === o.value ? 'bg-primary text-primary-foreground' : 'hover:bg-surface2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AccentChip({ active, color, children, onClick }: { active: boolean; color: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${active ? 'border-text' : 'border-border hover:bg-surface2'}`}
    >
      <span className={`w-4 h-4 rounded-full ${color}`} />
      {children}
    </button>
  );
}
