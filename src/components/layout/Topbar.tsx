import { BookMarked, Film, Tv2, ArrowDownToLine, ArrowUpFromLine, LayoutGrid, Plus, Search, Settings, Table, type LucideProps } from 'lucide-react';
import { useBooks } from '../../store/booksStore';
import { useMedia } from '../../store/mediaStore';
import { useSettings } from '../../store/settingsStore';
import { ColumnManager } from '../ui/ColumnManager';
import { BOOK_COLUMN_LABELS, FILM_COLUMN_LABELS, TV_COLUMN_LABELS } from '../../constants/columns';
import { cn } from '../../lib/utils';
import type { Section } from './AppShell';

interface Props {
  section: Section;
  onSection: (s: Section) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
}

const SECTIONS: { value: Section; icon: React.ComponentType<LucideProps>; title: string }[] = [
  { value: 'books', icon: BookMarked, title: 'Kitaplar' },
  { value: 'movies', icon: Film, title: 'Filmler' },
  { value: 'tv', icon: Tv2, title: 'Diziler' },
];

const ADD_LABEL: Record<Section, string> = {
  books: 'Kitap Ekle',
  movies: 'Film Ekle',
  tv: 'Dizi Ekle',
};

const SEARCH_PLACEHOLDER: Record<Section, string> = {
  books: 'Başlık, yazar, ISBN, not içinde ara…',
  movies: 'Başlık, yönetmen, not içinde ara…',
  tv: 'Başlık, yönetmen, not içinde ara…',
};

export function Topbar({ section, onSection, searchRef, onAdd, onImport, onExport, onSettings }: Props) {
  const books = useBooks();
  const media = useMedia();
  const { view, set, setColumns, bookColumns, filmColumns, tvColumns } = useSettings();

  const search = section === 'books' ? books.search : media.search;
  const setSearch = section === 'books' ? books.setSearch : media.setSearch;

  const colConfig = section === 'books' ? bookColumns : section === 'movies' ? filmColumns : tvColumns;
  const colLabels = section === 'books' ? BOOK_COLUMN_LABELS : section === 'movies' ? FILM_COLUMN_LABELS : TV_COLUMN_LABELS;
  const colSection = section === 'books' ? 'book' : section === 'movies' ? 'film' : 'tv';

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur px-5 flex items-center shrink-0">
      {/* Sol — arama */}
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER[section]}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Orta — sekmeler, görünüm, sütunlar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
          {SECTIONS.map(({ value, icon: Icon, title }) => (
            <button
              key={value}
              onClick={() => onSection(value)}
              title={title}
              className={cn('px-3 py-2', section === value ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2')}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
          <button onClick={() => set('view', 'table')} className={cn('px-3 py-2', view === 'table' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2')} title="Tablo">
            <Table size={15} />
          </button>
          <button onClick={() => set('view', 'card')} className={cn('px-3 py-2', view === 'card' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2')} title="Kart">
            <LayoutGrid size={15} />
          </button>
        </div>

        {view === 'table' && (
          <ColumnManager columns={colConfig} labels={colLabels} onChange={(cols) => setColumns(colSection, cols)} />
        )}
      </div>

      {/* Sağ — import/export/ayarlar/ekle */}
      <div className="flex-1 flex items-center justify-end gap-2">
        {section === 'books' && (
          <>
            <button className="btn btn-outline" onClick={onImport}><ArrowDownToLine size={15} /> İçe Aktar</button>
            <button className="btn btn-outline" onClick={onExport}><ArrowUpFromLine size={15} /> Dışa Aktar</button>
          </>
        )}
        <button className="btn btn-ghost" onClick={onSettings} title="Ayarlar"><Settings size={15} /></button>
        <button className="btn btn-primary" onClick={onAdd}><Plus size={15} /> {ADD_LABEL[section]}</button>
      </div>
    </header>
  );
}
