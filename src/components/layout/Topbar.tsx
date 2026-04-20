import { BookMarked, Film, Tv2, ArrowDownToLine, ArrowUpFromLine, LayoutGrid, Moon, Plus, Search, Settings, Sun, Table, type LucideProps } from 'lucide-react';
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

export function Topbar({ section, onSection, onAdd, onImport, onExport, onSettings }: Props) {
  const books = useBooks();
  const media = useMedia();
  const { theme, view, set, setColumns, bookColumns, filmColumns, tvColumns } = useSettings();
  const isDark = theme === 'dark';

  const search = section === 'books' ? books.search : media.search;
  const setSearch = section === 'books' ? books.setSearch : media.setSearch;

  const colConfig = section === 'books' ? bookColumns : section === 'movies' ? filmColumns : tvColumns;
  const colLabels = section === 'books' ? BOOK_COLUMN_LABELS : section === 'movies' ? FILM_COLUMN_LABELS : TV_COLUMN_LABELS;
  const colSection = section === 'books' ? 'book' : section === 'movies' ? 'film' : 'tv';

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur px-4 flex items-center gap-2 shrink-0">
      {/* Arama */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={SEARCH_PLACEHOLDER[section]}
          className="input pl-9 text-sm"
        />
      </div>

      {/* Bölüm sekmeleri — sadece ikon */}
      <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
        {SECTIONS.map(({ value, icon: Icon, title }) => (
          <button
            key={value}
            onClick={() => onSection(value)}
            title={title}
            className={cn(
              'px-2.5 py-2',
              section === value ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2',
            )}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Görünüm toggle */}
      <div className="hidden sm:flex items-center border border-border rounded-lg bg-surface overflow-hidden">
        <button
          onClick={() => set('view', 'table')}
          className={cn('px-2.5 py-2', view === 'table' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2')}
          title="Tablo"
        >
          <Table size={16} />
        </button>
        <button
          onClick={() => set('view', 'card')}
          className={cn('px-2.5 py-2', view === 'card' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2')}
          title="Kart"
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      {/* Sütun yöneticisi — sadece tablo görünümünde */}
      {view === 'table' && (
        <ColumnManager
          columns={colConfig}
          labels={colLabels}
          onChange={(cols) => setColumns(colSection, cols)}
        />
      )}

      <button className="btn btn-ghost" onClick={() => set('theme', isDark ? 'light' : 'dark')} title="Tema">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {section === 'books' && (
        <>
          <button className="btn btn-outline" onClick={onImport}><ArrowDownToLine size={16} /> İçe Aktar</button>
          <button className="btn btn-outline" onClick={onExport}><ArrowUpFromLine size={16} /> Dışa Aktar</button>
        </>
      )}

      <button className="btn btn-ghost" onClick={onSettings} title="Ayarlar"><Settings size={16} /></button>
      <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> {ADD_LABEL[section]}</button>
    </header>
  );
}
