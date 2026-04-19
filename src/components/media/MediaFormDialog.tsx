import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { MEDIA_STATUSES } from '../../constants/mediaStatuses';
import { smartTitleCase } from '../../lib/utils';
import type { Media, MediaStatus, MediaType } from '../../types/media';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (m: Omit<Media, 'id' | 'addedAt' | 'updatedAt'>) => void;
  initial?: Media;
  type: MediaType;
}

type FormState = Omit<Media, 'id' | 'addedAt' | 'updatedAt'>;

function empty(type: MediaType): FormState {
  return {
    title: '',
    type,
    director: '',
    releaseYear: undefined,
    watchYear: undefined,
    status: 'izlenecek',
    notes: '',
  };
}

export function MediaFormDialog({ open, onClose, onSave, initial, type }: Props) {
  const [form, setForm] = useState<FormState>(empty(type));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty(type), ...initial } : empty(type));
      setErrors({});
    }
  }, [open, initial, type]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Başlık zorunlu';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, title: form.title.trim() });
    onClose();
  };

  const typeLabel = type === 'film' ? 'Film' : 'Dizi';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `${typeLabel}i Düzenle` : `Yeni ${typeLabel}`}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button type="submit" form="media-form" className="btn btn-primary">
            {initial ? 'Kaydet' : 'Ekle'}
          </button>
        </>
      }
    >
      <form id="media-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Başlık *" error={errors.title}>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: smartTitleCase(f.title, e.target.value) }))}
              autoFocus
            />
          </Field>
        </div>
        <Field label="Yönetmen">
          <input
            className="input"
            value={form.director ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, director: smartTitleCase(f.director ?? '', e.target.value) }))}
          />
        </Field>
        <Field label="Durum">
          <select
            className="input"
            value={form.status}
            onChange={(e) => update('status', e.target.value as MediaStatus)}
          >
            {MEDIA_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Çıkış Yılı">
          <input
            type="number"
            className="input"
            value={form.releaseYear ?? ''}
            onChange={(e) => update('releaseYear', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <Field label="İzlenme Yılı">
          <input
            type="number"
            className="input"
            value={form.watchYear ?? ''}
            onChange={(e) => update('watchYear', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notlar">
            <textarea
              className="input min-h-[88px]"
              value={form.notes ?? ''}
              onChange={(e) => update('notes', e.target.value)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="text-xs text-secondary mt-1 block">{error}</span>}
    </label>
  );
}
