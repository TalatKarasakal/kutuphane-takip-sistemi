import { Modal } from '../ui/Modal';
import { useSettings } from '../../store/settingsStore';
import { FONT_OPTIONS } from '../../lib/theme';

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
      </div>
    </Modal>
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
