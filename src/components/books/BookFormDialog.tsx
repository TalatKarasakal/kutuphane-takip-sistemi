import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { STATUSES } from '../../constants/statuses';
import { GENRES } from '../../constants/genres';
import { useBooks } from '../../store/booksStore';
import { smartTitleCase } from '../../lib/utils';
import type { Book, BookStatus } from '../../types/book';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (b: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>) => void;
  initial?: Book;
}

type FormState = Omit<Book, 'id' | 'addedAt' | 'updatedAt'>;

const EMPTY: FormState = {
  title: '',
  author: '',
  publisher: '',
  pageCount: undefined,
  genre: '',
  isbn: '',
  publicationYear: undefined,
  language: '',
  translator: '',
  status: 'mevcut',
  notes: '',
  readStartDate: '',
  readEndDate: '',
};

export function BookFormDialog({ open, onClose, onSave, initial }: Props) {
  const { books } = useBooks();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const authors = useMemo(
    () => [...new Set(books.map((b) => b.author).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr')),
    [books],
  );
  const publishers = useMemo(
    () => [...new Set(books.map((b) => b.publisher).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'tr')),
    [books],
  );

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
      setErrors({});
    }
  }, [open, initial]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const updateText = (k: 'title' | 'author' | 'publisher', v: string) => {
    setForm((f) => ({ ...f, [k]: smartTitleCase((f[k] as string) ?? '', v) }));
  };

  const submit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Başlık zorunlu';
    if (!form.author.trim()) e.author = 'Yazar zorunlu';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Kitabı Düzenle' : 'Yeni Kitap'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button type="submit" form="book-form" className="btn btn-primary">{initial ? 'Kaydet' : 'Ekle'}</button>
        </>
      }
    >
      <form id="book-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Başlık *" error={errors.title}>
          <input className="input" value={form.title} onChange={(e) => updateText('title', e.target.value)} autoFocus />
        </Field>
        <Field label="Yazar *" error={errors.author}>
          <input list="author-list" className="input" value={form.author} onChange={(e) => updateText('author', e.target.value)} />
          <datalist id="author-list">{authors.map((a) => <option key={a} value={a} />)}</datalist>
        </Field>
        <Field label="Yayınevi">
          <input list="publisher-list" className="input" value={form.publisher ?? ''} onChange={(e) => updateText('publisher', e.target.value)} />
          <datalist id="publisher-list">{publishers.map((p) => <option key={p} value={p} />)}</datalist>
        </Field>
        <Field label="Tür">
          <input list="genre-list" className="input" value={form.genre ?? ''} onChange={(e) => update('genre', e.target.value)} />
          <datalist id="genre-list">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
        </Field>
        <Field label="Sayfa Sayısı">
          <input type="number" className="input" value={form.pageCount ?? ''} onChange={(e) => update('pageCount', e.target.value ? Number(e.target.value) : undefined)} />
        </Field>
        <Field label="Yayın Yılı">
          <input type="number" className="input" value={form.publicationYear ?? ''} onChange={(e) => update('publicationYear', e.target.value ? Number(e.target.value) : undefined)} />
        </Field>
        <Field label="ISBN">
          <input className="input" value={form.isbn ?? ''} onChange={(e) => update('isbn', e.target.value)} />
        </Field>
        <Field label="Dil">
          <input className="input" value={form.language ?? ''} onChange={(e) => update('language', e.target.value)} />
        </Field>
        <Field label="Çevirmen">
          <input className="input" value={form.translator ?? ''} onChange={(e) => update('translator', e.target.value)} />
        </Field>
        <Field label="Durum">
          <select className="input" value={form.status} onChange={(e) => update('status', e.target.value as BookStatus)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Okumaya Başlama">
          <input type="date" className="input" value={form.readStartDate ?? ''} onChange={(e) => update('readStartDate', e.target.value)} />
        </Field>
        <Field label="Okumayı Bitirme">
          <input type="date" className="input" value={form.readEndDate ?? ''} onChange={(e) => update('readEndDate', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notlar">
            <textarea className="input min-h-[88px]" value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
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
